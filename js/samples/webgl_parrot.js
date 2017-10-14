(function() {
  window.samples.webgl_parrot = parrotSequencer([
    {
      duration: 3.0,
      objects: [
        {
          name: 'lptm',
          tweens: [
            {name: 'modelTranslation', values: [[0, 0], [100, 0]], transition: 'linear'},
            {name: 'modelRotation', values: [null, [10, 0]], transition: 'linear'},
            {name: 'voxelScale', values: [[100, 1]], transition: 'easeOutCubic'},
            {name: 'voxelRotation', values: [[100, 0], [200, 0]], transition: 'easeOutCubic'},
          ]
        },
      ],
    },
    {
      duration: 2.0,
      objects: [
        {
          name: 'lptm',
          tweens: [
            {name: 'modelTranslation', values: [[0, 0]], transition: 'linear'},
          ]
        },
      ],
    },
    {
      duration: 3.0,
      objects: [
        {
          name: 'lptm',
          tweens: [
            {name: 'modelTranslation', values: [[0, 0], [0, 100]], transition: 'linear'},
            {name: 'modelRotation', values: [null, [0, 10]], transition: 'linear'},
            {name: 'voxelScale', values: [[0, 100]], transition: 'easeOutCubic'},
          ]
        },
      ],
    },
  ], true);
})();
