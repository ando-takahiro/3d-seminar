function introCharacter(anim, x, z=0) {
  return {
    lifeTime: 8.0,
    anim: anim,
    properties: [
      {
        name: 'modelTranslation',
        keyFrames: [
          {time: 0, value: [x, 100, z]},
          {time: 3, value: [x, 0], transition: 'linear'},
          {time: 5, value: null},
          {time: 8, value: [x, 100], transition: 'linear'},
        ]
      },
      {
        name: 'modelRotation',
        keyFrames: [
          {time: 0, value: [0, 10]},
          {time: 3, value: [0, 0], transition: 'linear'},
        ]
      },
      {
        name: 'voxelScale',
        keyFrames: [
          {time: 0, value: [100]},
          {time: 3, value: [1], transition: 'easeOutCubic'},
          {time: 5, value: null},
          {time: 8, value: [100], transition: 'easeInCubic'},
        ]
      },
      {
        name: 'voxelRotation',
        keyFrames: [
          {time: 0, value: [100, 200]},
          {time: 3, value: [0, 0], transition: 'easeOutCubic'},
          {time: 5, value: null},
          {time: 8, value: [100], transition: 'easeInCubic'},
        ]
      }
    ]
  };
}
