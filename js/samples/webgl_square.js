(function() {
  // based on this tutorial:
  // https://github.com/bjacob/webgl-tutorial/blob/master/01-red-triangle.html

  const vertexShaderString = 
  'attribute vec2 vertexPosition;                  \n\
   void main(void) {                               \n\
     gl_Position = vec4(vertexPosition, 0.0, 1.0); \n\
   }                                               \n';

  const fragmentShaderString =
  'precision mediump float;                   \n\
   void main(void) {                          \n\
     gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); \n\
   }                                          \n';

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

    const vertices = [
      -1.0,  1.0,
       1.0,  1.0,
       1.0, -1.0,

      -1.0,  1.0,
      -1.0, -1.0,
       1.0, -1.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexPositionAttrLoc, 2, gl.FLOAT, false, 0, 0);
    // gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.drawArrays(gl.LINE_STRIP, 0, 6);
  }

  // Register app.
  // See js/framework.js for details.
  window.samples.webgl_square = framework(start);
})();
