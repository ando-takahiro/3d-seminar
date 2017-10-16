(function() {
  var eventEmitter = new EventEmitter();

  window.sample_defaults = {
    addListener: function(event, listener) {
      eventEmitter.addListener(event, listener);
    },
    width: 320,
    height: 240,
    paused: false,
    wireframe: false,
    current_normal_map: "normal_map_tile.jpg",
    normal_maps: [
      "normal_map_face.PNG",
      "normal_map_circle.jpg",
      "normal_map_tile.jpg"
    ]
  };

  window.samples = {};
  function createSample($el) {
    var index = $el.data("sample");
    var instance = window.samples[index].initialize($el[0]);
    $el.data("instance", instance);
    return instance;
  };

  function runCurrentSample(currentSlide) {
    $(currentSlide).find("[data-sample]").each(function() {
      var instance = createSample($(this));
      if(instance) instance.active = true;
    });
  };

  function initializeOnLoad() {
    runCurrentSample($("section.present"));

    // Activate appropriate sample on slide change.
    Reveal.addEventListener('slidechanged', function(event) {
      // Clear all slides
      $("[data-sample]").each(function() {
        var instance = $(this).data("instance");
        if(instance) instance.active = false;
      });

      var currentSlide = event.currentSlide;
      runCurrentSample(currentSlide);
    });

    eventEmitter.emitEvent("initialized");
  }

  head.js(
    // libs
    "lib/js/gl-matrix-min.js",
    "lib/js/tw.js",
    "lib/js/screenfull.min.js",

    // common modules
    "js/samples/font8x8.js",
    "js/samples/framework.js",
    "js/samples/parrot_particle.js",
    "js/samples/parrot_particle_spawner.js",
    "js/samples/parrot_particle_intro.js",
    "js/samples/parrot_particle_ticker.js",
    "js/samples/parrot_particle_camera.js",
    "js/samples/parrot_particle_cut.js",
    'js/samples/parrot_particle_bitmap.js',
    'js/samples/parrot_particle_util.js',
    'js/samples/parrot_party_bitmap.js',

    // animations
    'js/anim/speed.js',
    'js/anim/parrot_anim.js',
    'js/anim/lptm_anim.js',
    'js/anim/chainerparrot_anim.js',
    'js/anim/confusedparrot_anim.js',
    'js/anim/dealwithparrot_anim.js',
    'js/anim/fasterparrot_anim.js',
    'js/anim/fastestparrot_anim.js',
    'js/anim/fastparrot_anim.js',
    'js/anim/loveparrot_anim.js',
    'js/anim/matrixparrot_anim.js',
    'js/anim/nyanparrot_anim.js',
    'js/anim/parrotdad_anim.js',
    'js/anim/party_parrot_anim.js',
    'js/anim/poyoparrot_anim.js',
    'js/anim/scienceparrot_anim.js',
    'js/anim/sirocco_anim.js',
    'js/anim/sleepyparrot_anim.js',
    'js/anim/stableparrot_anim.js',
    'js/anim/thumbsupparrot_anim.js',
    'js/anim/gpuconcernedparrot_anim.js',

    // samples
    "js/samples/webgl_points.js",
    "js/samples/webgl_line.js",
    "js/samples/webgl_lines.js",
    "js/samples/webgl_triangle.js",
    "js/samples/webgl_triangle_vs.js",
    "js/samples/webgl_triangle_ps.js",
    "js/samples/webgl_projection_transformation.js",
    "js/samples/webgl_view_transformation.js",
    "js/samples/webgl_model_transformation.js",
    "js/samples/webgl_square.js",
    "js/samples/webgl_square_indices.js",
    "js/samples/webgl_parrot.js",
    "js/samples/webgl_parrot_party.js",
    initializeOnLoad);
})();
