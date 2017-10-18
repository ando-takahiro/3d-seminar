(function() {
  // based on this tutorial:
  // https://github.com/bjacob/webgl-tutorial/blob/master/01-red-triangle.html

  const vertexShaderString = 
  'attribute vec3 vertexPosition;  \n\
   uniform mat4 projection;        \n\
   uniform mat4 view;              \n\
   void main(void) {               \n\
     gl_Position = projection *    \n\
       view *                      \n\
       vec4(vertexPosition, 1.);   \n\
   }                               \n';

  const fragmentShaderString =
  'precision mediump float;                   \n\
   void main(void) {                          \n\
     vec2 p = abs(sin(gl_FragCoord.xy / 32.0));\n\
     gl_FragColor = vec4(p.x, p.y, p.x * (1.0-p.y), 1.0);\n\
   }                                          \n';

  const vertices = [
    -1,-1,-1,  1,-1,-1,  1, 1,-1, -1, 1,-1,
    -1,-1, 1,  1,-1, 1,  1, 1, 1, -1, 1, 1,
    -1,-1,-1, -1, 1,-1, -1, 1, 1, -1,-1, 1,
     1,-1,-1,  1, 1,-1,  1, 1, 1,  1,-1, 1,
    -1,-1,-1, -1,-1, 1,  1,-1, 1,  1,-1,-1,
    -1, 1,-1, -1, 1, 1,  1, 1, 1,  1, 1,-1, 
  ]; // 24 vertices

  const indices = [
     0,1,2, 0,2,3, 4,5,6, 4,6,7,
     8,9,10, 8,10,11, 12,13,14, 12,14,15,
     16,17,18, 16,18,19, 20,21,22, 20,22,23 
  ];

  function start(gl) {
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

    const vertexPositionAttrLoc = gl.getAttribLocation(program, "vertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttrLoc);

    var vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    const indexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexPositionBuffer);

    const view = mat4.create();
    mat4.identity(view);
    mat4.fromTranslation(view, [0.0, 0.0, 10]);
    // Actually, moving camera is
    // done by moving entire world!
    // `invert` does this.
    mat4.invert(view, view); 
    const uniformView = gl.getUniformLocation(program, "view");
    gl.uniformMatrix4fv(uniformView, false, view);

    const projection = mat4.create();
    const fovy = 0.5;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const near = 0.0001;
    const far = 1000;
    mat4.perspective(projection, fovy, aspect, near, far);
    const uniformProjection = gl.getUniformLocation(program, "projection");
    gl.uniformMatrix4fv(uniformProjection, false, projection);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(indices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexPositionAttrLoc, 3, gl.FLOAT, false, 0, 0);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  }

  // Register app.
  // See js/framework.js for details.
  window.samples.webgl_view_transformation = framework(start);
})();
