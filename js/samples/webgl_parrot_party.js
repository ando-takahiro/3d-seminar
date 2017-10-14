(function() {
  window.samples.webgl_parrot_party = parrotSequencer([
    {
      duration: 3.0,
      objects: [
        {
          name: 'parrot',
          tweens: [
            {name: 'modelTranslation', values: [[16, 16], [100, 0]], transition: 'linear'},
            {name: 'modelRotation', values: [null, [10, 0]], transition: 'linear'},
            {name: 'voxelScale', values: [[100, 1]], transition: 'easeOutCubic'},
            {name: 'voxelRotation', values: [[100, 0], [200, 0]], transition: 'easeOutCubic'},
          ]
        },
        {
          name: 'lptm',
          tweens: [
            {name: 'modelTranslation', values: [[-16, -16], [100, 0]], transition: 'linear'},
            {name: 'modelRotation', values: [null, [10, 0]], transition: 'linear'},
            {name: 'voxelScale', values: [[100, 1]], transition: 'easeOutCubic'},
            {name: 'voxelRotation', values: [[100, 0], [200, 0]], transition: 'easeOutCubic'},
          ]
        }
      ],
    },
    {
      duration: 2.0,
      objects: [
        {
          name: 'parrot',
          tweens: [
            {name: 'modelTranslation', values: [[16, 16]], transition: 'linear'},
          ]
        },
        {
          name: 'lptm',
          tweens: [
            {name: 'modelTranslation', values: [[-16, -16]], transition: 'linear'},
          ]
        }
      ],
    },
    {
      duration: 3.0,
      objects: [
        {
          name: 'parrot',
          tweens: [
            {name: 'modelTranslation', values: [[16, 16], [0, 100]], transition: 'linear'},
            {name: 'modelRotation', values: [null, [0, 10]], transition: 'linear'},
            {name: 'voxelScale', values: [[0, 100]], transition: 'easeOutCubic'},
          ]
        },
        {
          name: 'parrot',
          tweens: [
            {name: 'modelTranslation', values: [[-16, -16], [0, 100]], transition: 'linear'},
            {name: 'modelRotation', values: [null, [0, 10]], transition: 'linear'},
            {name: 'voxelScale', values: [[1, 80]], transition: 'easeOutCubic'},
          ]
        }
      ],
    },
  ]);
})();
