function parrotSequencer(sequence, loop, audioId) {

  // prepend null span
  sequence.unshift({ duration: -1.0, objects: [] });

  const animList = [
    'parrot',
    'lptm',
  ];

  const vertexShaderString = `
attribute vec3 vertexPosition;
attribute vec2 voxelPosition;
attribute vec4 voxelColor;
uniform vec3 voxelRotation;
uniform vec3 voxelScale;
uniform mat4 model;
uniform mat4 projection;
uniform mat4 view;
varying vec4 vertexColor;

mat4 rotationMatrix(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1. - c;
  
  return mat4(
    oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.,
    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.,
    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.,
    0.,                                 0.,                                 0.,                                 1.);
}

void main(void) {
  vec2 vp = voxelPosition;
  vec2 _01 = vec2(0., 1.);
  mat4 voxel =
    rotationMatrix(vec3(0., 1., 0.), voxelRotation.y * (vp.x + vp.y) * 0.01) *
    mat4(
      _01.yxxx,
      _01.xyxx,
      _01.xxyx,
      vec4(vp * voxelScale.x, _01)
    ) *
    rotationMatrix(vec3(0., 1., 0.), voxelRotation.x);

  gl_Position = projection *
    view *
    model *
    voxel *
    vec4(vertexPosition * voxelColor.a, 1.);

  vertexColor = voxelColor;
}`;

  const fragmentShaderString = `
precision mediump float;
varying vec4 vertexColor;
void main(void) {
  gl_FragColor = vertexColor;
}`;

  const audio = audioId && document.getElementById(audioId);

  const vertices = [
    -1,-1,-1,  1,-1,-1,  1, 1,-1, -1, 1,-1,
    -1,-1, 1,  1,-1, 1,  1, 1, 1, -1, 1, 1,
    -1,-1,-1, -1, 1,-1, -1, 1, 1, -1,-1, 1,
     1,-1,-1,  1, 1,-1,  1, 1, 1,  1,-1, 1,
    -1,-1,-1, -1,-1, 1,  1,-1, 1,  1,-1,-1,
    -1, 1,-1, -1, 1, 1,  1, 1, 1,  1, 1,-1
  ].map(m => m * 0.5);

  const indices = [
     0,1,2, 0,2,3, 4,5,6, 4,6,7,
     8,9,10, 8,10,11, 12,13,14, 12,14,15,
     16,17,18, 16,18,19, 20,21,22, 20,22,23 
  ];

  const resolution = 32;
  const voxels = []; 
  for (var i = 0; i < resolution * resolution; ++i) {
    voxels.push(i % resolution - resolution / 2, Math.floor(i / resolution) - resolution / 2);
  }

  const view = mat4.create();
  let uniformView, uniformModel, uniformVoxelRotation;
  let ext;
  let time;
  let spanTime;
  let currentSpan;
  let lasTweenResult;
  let animations = {}, voxelColorAttrLoc;

  function start(gl) {
    ext = gl.getExtension('ANGLE_instanced_arrays');
    time = 0;
    spanTime = 0.0;
    currentSpan = 0;
    lasTweenResult = [];

    // start audio
    if (audio) {
      audio.play();
    }

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderString);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderString);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    const vertexPositionAttrLoc = gl.getAttribLocation(program, "vertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttrLoc);
    gl.vertexAttribPointer(vertexPositionAttrLoc, 3, gl.FLOAT, false, 0, 0);

    const indexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexPositionBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(indices), gl.STATIC_DRAW);

    const voxelPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, voxelPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(voxels), gl.STATIC_DRAW);
    const voxelPositionAttrLoc = gl.getAttribLocation(program, "voxelPosition");
    gl.enableVertexAttribArray(voxelPositionAttrLoc);
    gl.vertexAttribPointer(voxelPositionAttrLoc, 2, gl.FLOAT, false, 0, 0);
    ext.vertexAttribDivisorANGLE(voxelPositionAttrLoc, 1);

    voxelColorAttrLoc = gl.getAttribLocation(program, "voxelColor");
    ext.vertexAttribDivisorANGLE(voxelColorAttrLoc, 1);

    animations = animList.reduce((ret, key) => {
      ret[key] = window[`${key}Anim`].map((anim, index) => {
        const voxelColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, voxelColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(anim), gl.STATIC_DRAW);
        return voxelColorBuffer;
      });
      return ret;
    }, {});

    mat4.fromTranslation(view, [0.0, 0.0, 100]);
    // Actually, moving camera is
    // done by moving entire world!
    // `invert` does this.
    mat4.invert(view, view); 
    uniformView = gl.getUniformLocation(program, "view");
    gl.uniformMatrix4fv(uniformView, false, view);

    uniformModel = gl.getUniformLocation(program, "model");

    const projection = mat4.create();
    const fovy = 0.5;
    const aspect = gl.canvas.width / gl.canvas.height;
    const near = 0.000001;
    const far = 100000;
    mat4.perspective(projection, fovy, aspect, near, far);
    const uniformProjection = gl.getUniformLocation(program, "projection");
    gl.uniformMatrix4fv(uniformProjection, false, projection);

    // other uniforms
    uniformVoxelRotation = gl.getUniformLocation(program, 'voxelRotation');
    uniformVoxelScale = gl.getUniformLocation(program, 'voxelScale');
  }
  
  function tween() {
    const cur = sequence[currentSpan];
    return cur.objects.map(obj => {
      const {name, tweens} = obj;
      const result = {
        name: name,
        modelTranslation: [0, 0, 0],
        modelRotation: [0, 0, 0],
        voxelScale: [1, 1, 1],
        voxelRotation: [0, 0, 0],
      };

      tweens.forEach(t => {
        const {transition, name, values} = t;
        const f = Tweener.easingFunctions[transition || 'easeInOutCubic'];
        values.forEach((v, index) => {
          if (v) {
            result[name][index] = f(spanTime, v[0], v[1] - v[0], cur.duration);
          }
        });
      });

      return result;
    });
  }

  function nextSpan() {
    currentSpan++;
    spanTime = 0.0;

    if (loop && currentSpan >= sequence.length) {
      currentSpan = 0;
    }
  }

  function sequencer(deltaTime) {
    if (currentSpan < sequence.length) {
      spanTime += deltaTime;

      lastTweenResult = tween();

      const cur = sequence[currentSpan];
      if (spanTime >= cur.duration) {
        nextSpan();
      }
    }

    return lastTweenResult;
  }

  let lastTimestamp = 0;
  function update(gl, timestamp) {
    if (lastTimestamp <= 0) {
      lastTimestamp = timestamp;
    }

    const deltaTime = (timestamp - lastTimestamp) * 0.001;
    time += deltaTime;
    lastTimestamp = timestamp;

    const model = mat4.create();
    sequencer(deltaTime).forEach(obj => {
      mat4.identity(model);
      mat4.translate(model, model, obj.modelTranslation);
      mat4.rotateX(model, model, obj.modelRotation[0]);
      mat4.rotateY(model, model, obj.modelRotation[1]);
      mat4.rotateZ(model, model, obj.modelRotation[2]);
      gl.uniformMatrix4fv(uniformModel, false, model);

      gl.uniform3fv(uniformVoxelRotation, obj.voxelRotation);
      gl.uniform3fv(uniformVoxelScale, obj.voxelScale);

      const anim = animations[obj.name];
      const index = Math.floor((time * anim.length) % anim.length);
      gl.bindBuffer(gl.ARRAY_BUFFER, anim[index]);
      gl.enableVertexAttribArray(voxelColorAttrLoc);
      gl.vertexAttribPointer(voxelColorAttrLoc, 4, gl.FLOAT, false, 0, 0);

      ext.drawElementsInstancedANGLE(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0, resolution * resolution);
    });
  }

  function end() {
    if (audio) {
      audio.pause();
    }
  }

  // Register app.
  // See js/framework.js for details.
  return framework(start, update, end);
};
