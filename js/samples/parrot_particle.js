// Let's think parrots as particles
function parrotParticle(sequenceFn, loop, audioId) {

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
    // trick for early culling if voxel is transparent
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

  let ext;
  let uniformView, uniformModel, uniformVoxelRotation, voxelColorAttrLoc; 
  let scene;
  let waitingGenerators, particles, particleGenerators;
  let animations = {};

  function start(gl) {
    ext = gl.getExtension('ANGLE_instanced_arrays');
    scene = {
      time: 0,
      lastTimestamp: 0,
      view: makeViewMatrix([0, 0, 100])
    };
    particles = [];
    particleGenerators = [];
    waitingGenerators = sequenceFn();

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

    animations = Object.keys(window.anims).reduce((ret, name) => {
      ret[name] = window.anims[name].map((anim, index) => {
        const voxelColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, voxelColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(anim), gl.STATIC_DRAW);
        return voxelColorBuffer;
      });
      return ret;
    }, {});

    uniformView = gl.getUniformLocation(program, "view");
    gl.uniformMatrix4fv(uniformView, false, scene.view);

    uniformModel = gl.getUniformLocation(program, "model");

    const projection = mat4.create();
    const fovy = 0.5;
    const aspect = gl.canvas.width / gl.canvas.height;
    const near = 0.001;
    const far = 1000;
    mat4.perspective(projection, fovy, aspect, near, far);
    const uniformProjection = gl.getUniformLocation(program, "projection");
    gl.uniformMatrix4fv(uniformProjection, false, projection);

    // other uniforms
    uniformVoxelRotation = gl.getUniformLocation(program, 'voxelRotation');
    uniformVoxelScale = gl.getUniformLocation(program, 'voxelScale');
  }
  
  function interpolateKeyFrames(property) {
    const lastValue = [...(property.keyFrames[0].value || [])];

    return {
      ...property,
      keyFrames: property.keyFrames.map(keyFrame => {
        if (keyFrame.value) {
          for (let i = 0; i < Math.max(lastValue.length, keyFrame.value.length); i++) {
            lastValue[i] = typeof keyFrame.value[i] === 'number' ? keyFrame.value[i] : lastValue[i];
          }
        }

        return {
          ...keyFrame,
          value: [...lastValue]
        };
      })
    };
  }

  function spawnParticle(definition) {
    const common = {
      type: definition.type || 'Particle',
      definition: definition,
      begin: scene.time,
      end: scene.time + definition.lifeTime,
      cameraTranslation: [0, 0, 0],
      cameraRotation: [0, 0, 0],
      properties: definition.properties.map(interpolateKeyFrames),
      eval: definition.eval,
    };

    if (common.type === 'SceneModifier') {
      return {
        ...common,

        cameraTranslation: [0, 0, 0],
        cameraRotation: [0, 0, 0, 1], // sorry, only camera rotation is quaternion
      };
    } else {
      return {
        ...common,

        anim: definition.anim,
        animOffset: definition.animOffset || 0,
        modelTranslation: [0, 0, 0],
        modelRotation: [0, 0, 0],
        modelScale: [1, 1, 1],
        voxelScale: [1, 1, 1],
        voxelRotation: [0, 0, 0],
      };
    }
  }

  // keyFrames should be sorted by time
  function findKeyFramePair(keyFrames, age) {
    let i = 0;
    for (; i < keyFrames.length; i++) {
      if (age < keyFrames[i].time) {
        break;
      }
    }

    if (i === 0) {
      return [keyFrames[0], keyFrames[0]];
    } else if (i >= keyFrames.length) {
      const last = keyFrames[keyFrames.length - 1];
      return [last, last];
    } else {
      return [keyFrames[i - 1], keyFrames[i]];
    }
  }

  function modifyScene(modifier) {
    scene.view = makeViewMatrix(modifier.cameraTranslation, modifier.cameraRotation);
  }

  function updateParticle(p) { // p is particle, this function updates p
    const age = scene.time - p.begin;

    p.properties.forEach(prop => {
      const pair = findKeyFramePair(prop.keyFrames, age);
      const dest = p[prop.name];
      for (let i = 0; i < dest.length; i++) {
        const firstElem = pair[0].value[i];
        const secondElem = pair[1].value[i];
        if (typeof firstElem === 'number' && typeof secondElem === 'number') {
          // tween
          const deltaTime = pair[1].time - pair[0].time;
          if (deltaTime > 0) {
            const transition = pair[1].transition || 'easeInOutCubic';
            const f = Tweener.easingFunctions[transition];
            dest[i] = f(age - pair[0].time, firstElem, secondElem - firstElem, deltaTime);
          } else {
            dest[i] = firstElem;
          }
        } else if (typeof firstElem === 'number') {
          dest[i] = firstElem;
        } else if (typeof secondElem === 'number') {
          dest[i] = secondElem;
        }
      }
    });

    if (p.eval) {
      p.eval(p, scene.time);
    }

    if (p.type === 'SceneModifier') {
      modifyScene(p);
    }
  }

  function sequencer() {
    // activate generators
    particleGenerators.push(...waitingGenerators.filter(gen => gen.begin <= scene.time));
    waitingGenerators = waitingGenerators.filter(gen => gen.begin > scene.time);

    // do generate
    particleGenerators.forEach(
      gen => particles.push(...gen.eval(scene.time).map(spawnParticle))
    ); 
    // GC generators
    particleGenerators = particleGenerators.filter(gen => scene.time < gen.end);

    // update particles
    particles.forEach(updateParticle);

    // GC particles
    particles = particles.filter(p => p.end >= scene.time);

    if (loop && waitingGenerators.length <= 0 && particles.length <= 0 && particleGenerators.length <= 0) {
      scene.time = 0;
      waitingGenerators = sequenceFn();
    }
  }

  function renderParticle(gl, particle) {
    const model = makeModelMatrix(particle.modelTranslation, particle.modelRotation, particle.modelScale);
    gl.uniformMatrix4fv(uniformModel, false, model);

    gl.uniform3fv(uniformVoxelRotation, particle.voxelRotation);
    gl.uniform3fv(uniformVoxelScale, particle.voxelScale);

    const anim = animations[particle.anim];
    const animSpeed = window.animSpeed[particle.anim] || 7;
    const index = Math.floor((scene.time * animSpeed + particle.animOffset) % anim.length);
    gl.bindBuffer(gl.ARRAY_BUFFER, anim[index]);
    gl.enableVertexAttribArray(voxelColorAttrLoc);
    gl.vertexAttribPointer(voxelColorAttrLoc, 4, gl.FLOAT, false, 0, 0);

    ext.drawElementsInstancedANGLE(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0, resolution * resolution);
  }

  function update(gl, timestamp) {
    if (scene.lastTimestamp <= 0) {
      scene.lastTimestamp = timestamp;
    }

    const deltaTime = (timestamp - scene.lastTimestamp) * 0.001;
    scene.time += deltaTime;
    scene.lastTimestamp = timestamp;

    sequencer();

    gl.uniformMatrix4fv(uniformView, false, scene.view);

    particles
      .filter(p => p.type === 'Particle')
      .forEach(p => renderParticle(gl, p));
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
