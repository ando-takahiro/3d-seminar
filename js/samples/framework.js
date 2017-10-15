const _frameworkGCFuncs = [];

function framework(start, update, end) {
  const glBufferGCList = [];
  const id = Math.random();
  let defaultCanvasSize;

  return {
    // entry point of slideshow framework
    initialize: function(canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLost, false);
      // we can not recover since GC
      canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
      _frameworkGCFuncs.push(handleContextLost);

      if (canvas.classList.contains('fullscreen')) {
        canvas.width = window.screen.width;
        canvas.height = window.screen.height;
        screenfull.request(canvas);
      }

      if (defaultCanvasSize) {
        [canvas.width, canvas.height] = defaultCanvasSize;
      } else {
        defaultCanvasSize = [canvas.width, canvas.height];
      }

      let gl = canvas.getContext("webgl");

      const orgCreateBuffer = gl.createBuffer;
      gl.createBuffer = function () {
        const b = orgCreateBuffer.call(gl);
        glBufferGCList.push(b);
        return b;
      };

      gl.clearColor(1, 1, 1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      start(gl);

      const instance = {active: true};
      function animate(timestamp) {
        if (update) {
          if (timestamp !== undefined) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            update(gl, timestamp);
          }
          instance.requestId = window.requestAnimFrame(animate);
        }
      }

      animate();

      function handleContextLost(e) {
        if (e) e.preventDefault();
        if (instance.requestId !== undefined) {
          window.cancelAnimFrame(instance.requestId);
          instance.requestId = undefined;
        }

        if (canvas.classList.contains('fullscreen')) {
          screenfull.exit();
        }

        if (end) end();

        const numTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        for (let unit = 0; unit < numTextureUnits; ++unit) {
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, null);
          gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        glBufferGCList.forEach(b => gl.deleteBuffer(b));
        glBufferGCList.length = 0;

        gl.canvas.width = 1;
        gl.canvas.height = 1;

        _frameworkGCFuncs.splice(_frameworkGCFuncs.indexOf(handleContextLost), 1);
      }

      function handleContextRestored() {
        start(gl);
        animate();
      }

      return instance;
    }
  };
}

// The number of slidechanged event handlers should be 1
Reveal.addEventListener('slidechanged', function onSlideChange(event) {
  _frameworkGCFuncs.forEach(gc => gc());
  _frameworkGCFuncs.length = 0;
});

