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
    "js/samples/framework.js",
    "js/samples/parrot_sequencer.js",

    // TODO: move anims
    "js/parrot_anim.js",
    "js/lptm_anim.js",

    "js/samples/height_map_image.js",
    "js/samples/todo_lighted_spinning_textured_cube.js",
    "js/samples/todo_lighted_spinning_cube.js",
    "js/samples/particles.js",
    "js/samples/particle_height_map.js",
    "js/samples/particle_height_map_vertex_texture.js",
    "js/samples/shadow_map.js",
    "js/samples/render_to_texture.js",
    "js/samples/blur_post_process.js",
    "js/samples/webgl_spinning_wireframe_square.js",
    "js/samples/webgl_spinning_wireframe_cube.js",
    "js/samples/webgl_spinning_colored_cube.js",
    "js/samples/webgl_spinning_bland_cube.js",
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
    "js/samples/spinning_wireframe_torus.js",
    "js/samples/spinning_wireframe_cube.js",
    "js/samples/spinning_cube.js",
    "js/samples/spinning_textured_cube.js",
    "js/samples/lighted_spinning_cube.js",
    "js/samples/lighted_spinning_textured_cube.js",
    "js/samples/lighted_ambient_sphere.js",
    "js/samples/lighted_diffuse_sphere.js",
    "js/samples/lighted_specular_sphere.js",
    "js/samples/lighted_textured_sphere.js",
    "js/samples/lighted_sphere.js",
    "js/samples/per_vertex_lighting.js",
    "js/samples/normal_mapped_plane.js",
    "js/samples/plane.js",
    "js/samples/wireframe_plane.js",
    "js/samples/load_startrek_enterprise.js",
    "js/samples/load_apache.js",
    initializeOnLoad);
})();
