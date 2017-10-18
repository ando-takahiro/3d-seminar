(function() {
  function cut1() {
    return [
      parrotParticleSpawner(0, [
        introCharacter('parrot', 16),
        introCharacter('lptm', -16),
      ]),
      parrotParticleSpawner(5.0, [
        introCharacter('dealwithparrot', -20, -28, -10),
        introCharacter('stableparrot', 20, -20, 10),
      ]),
      parrotParticleSpawner(7.0, [
        introCharacter('parrotdad', 50, -35, 20),
        introCharacter('loveparrot', -80, -200, 60),
        introCharacter('chainerparrot', 100, 200, 15),
      ]),
      parrotParticleTicker(0.0, 'PARTY OR DIE', {
        particleLifeTime: 40,
      }),
    ];
  }

  function randomGenerateHelper(animNames, num, coreFn, offset=0) {
    return _.range(num).map(i => coreFn(i + offset, animNames));
  }

  function cut2() {
    const center = [0, 0, 100];
    const rotCycle = 13.5;

    const excludeAnims = [
      'gpuconcernedparrot',
      // 'parrotdad',
      'fastparrot',
      'fasterparrot',
      'fastestparrot',
    ];

    const animNames = Object.keys(window.anims).
      filter(name => excludeAnims.indexOf(name) < 0);


    function generateCore(i, animNames) {
      // for reproductivity, we avoid random.
      // so let's use cos + offset(salt) instead of random.
      const radius = 100 * Math.cos(i + 3) + 400;
      const yRadian = i * 0.1 + 0.125 * Math.floor(i / animNames.length);
      const xRadian = (Math.cos(i) + Math.sin(i + 10)) * 0.2;
      const pos = [
        Math.cos(yRadian) * Math.cos(xRadian) * radius + center[0], 
        Math.sin(xRadian) * radius + center[1],
        Math.sin(yRadian) * Math.cos(xRadian) * radius + center[2], 
      ];

      const scale = 1.0;
      const lifeTime = rotCycle;
      return {
        lifeTime: lifeTime,
        anim: animNames[i % animNames.length],
        properties: [
          {
            name: 'modelTranslation',
            keyFrames: [
              {time: 0, value: pos},
            ]
          },
          {
            name: 'modelRotation',
            keyFrames: [
              {time: 0, value: [0, Math.PI * 0.5 - yRadian]},
            ]
          },
          {
            name: 'modelScale',
            keyFrames: [
              {time: 0, value: [scale, scale, scale]},
            ]
          },
          {
            name: 'voxelScale',
            keyFrames: [
              {time: 0, value: [100]},
              {time: 3, value: [1], transition: 'easeOutCubic'},
              // {time: rotCycle - 3, value: null},
              // {time: rotCycle, value: [100], transition: 'easeInCubic'},
              // {time: rotCycle + 3, value: [1], transition: 'easeOutCubic'},
              {time: rotCycle - 3, value: null},
              {time: rotCycle, value: [100], transition: 'easeInCubic'},
            ]
          },
          {
            name: 'voxelRotation',
            keyFrames: [
              {time: 0, value: [100, 200]},
              {time: 3, value: [0, 0], transition: 'easeOutCubic'},
              // {time: rotCycle - 3, value: null},
              // {time: rotCycle, value: [100], transition: 'easeInCubic'},
              // {time: rotCycle + 3, value: [0, 0], transition: 'easeOutCubic'},
              {time: rotCycle - 3, value: null},
              {time: rotCycle, value: [100], transition: 'easeInCubic'},
            ]
          }
        ]
      };
    }

    const camRotQuat = quat.create();
    quat.rotateY(camRotQuat, camRotQuat, Math.PI * 0.5);
    const q1 = quat.create();
    quat.mul(q1, camRotQuat, camRotQuat);
    const q2 = quat.create();
    quat.mul(q2, q1, camRotQuat);
    const q3 = quat.create();
    quat.mul(q3, q2, camRotQuat);
    const q4 = quat.create();
    quat.mul(q4, q3, camRotQuat);
    const q5 = quat.create();
    quat.mul(q5, q4, camRotQuat);
    const q6 = quat.create();
    quat.mul(q6, q5, camRotQuat);
    const q7 = quat.create();
    quat.mul(q7, q6, camRotQuat);

    camCycle = rotCycle - 1.5;
    const gpuString = 'GPU! MORE! GPU! MORE! GPU! MORE! GPU! MORE!';
    const deepString = 'DEEP! MORE! DEEP! MORE! DEEP! MORE!';
    const camMove = [...center];
    camMove[1] += 100;
    const camMove2 = [...center];
    camMove2[1] += -100;

    return [
      parrotParticleSpawner(0, [
        parrotParticleCamera(camCycle * 2, [
          {
            name: 'cameraRotation',
            keyFrames: [
              {time: 0, value: [0, 0, 0, 1]},
              {time: camCycle * 0.25, value: camRotQuat},
              {time: camCycle * 0.5, value: q1},
              {time: camCycle * 0.75, value: q2},
              {time: camCycle * 1.0, value: q3},
              {time: camCycle * 1.25, value: q4},
              {time: camCycle * 1.5, value: q5},
              {time: camCycle * 1.75, value: q6},
              {time: camCycle * 2.0, value: q7},
            ],
          },
          {
            name: 'cameraTranslation',
            keyFrames: [
              {time: 0, value: center},
            ],
          }
        ]),
        ...randomGenerateHelper(animNames.slice(0, animNames.length / 2), 120, generateCore)
      ]),
      parrotParticleSpawner(rotCycle, [
        ...randomGenerateHelper(animNames.slice(animNames.length / 2), 120, generateCore, 200)
      ]),
      parrotParticleTicker(0.0, gpuString, {
        position: [80, 40, -50],
        anim: 'gpuconcernedparrot',
        particleLifetime: camCycle * 0.8,
        velocity: 8,
      }),
      parrotParticleTicker(0.0, gpuString, {
        position: [80, 0, 30],
        anim: 'gpuconcernedparrot',
        particleLifetime: camCycle * 0.8,
        velocity: 4,
      }),
      parrotParticleTicker(0.0, gpuString, {
        position: [100, -20, -20],
        anim: 'gpuconcernedparrot',
        particleLifetime: camCycle * 0.8,
        velocity: 8,
      }),
      parrotParticleTicker(0.0, gpuString, {
        position: [120, 80, -10],
        anim: 'gpuconcernedparrot',
        particleLifetime: camCycle * 0.8,
        velocity: 8,
      }),
      parrotParticleTicker(0.0, gpuString, {
        position: [100, -80, -80],
        anim: 'gpuconcernedparrot',
        particleLifetime: camCycle * 0.8,
        velocity: 8,
      }),
      parrotParticleTicker(camCycle, deepString, {
        position: [80, 40, -50],
        anim: 'gpuconcernedparrot',
        particleLifetime: camCycle * 0.8 - 3,
        velocity: 8,
      }),
      parrotParticleTicker(camCycle, deepString, {
        position: [80, 0, 30],
        anim: 'gpuconcernedparrot',
        particleLifetime: camCycle * 0.8 - 3,
        velocity: 4,
      }),
      parrotParticleTicker(camCycle, deepString, {
        position: [100, -20, -20],
        anim: 'gpuconcernedparrot',
        particleLifetime: camCycle * 0.8 - 3,
        velocity: 8,
      }),
      parrotParticleTicker(camCycle, deepString, {
        position: [120, 80, -10],
        anim: 'gpuconcernedparrot',
        particleLifetime: camCycle * 0.8 - 3,
        velocity: 8,
      }),
      parrotParticleTicker(0.0, gpuString, {
        position: [100, -80, -80],
        anim: 'gpuconcernedparrot',
        particleLifetime: camCycle * 0.8 - 3,
        velocity: 8,
      }),
    ];
  }

  function cut3() {
    const message = [
      // {str: 'More speed...  ', anim: 'parrot'},
      {str: 'Fast!  ', anim: 'fastparrot'},
      {str: 'Faster!!  ', anim: 'fasterparrot'},
      {str: 'Fastest!!!  ', anim: 'fastestparrot'},
    ].reduce((ret, val) => {
      ret.str += val.str;
      ret.anim.push(..._.range(val.str.length).map(() => val.anim));
      return ret;
    }, {str: '', anim: []})

    const lookDown = quat.create();
    quat.rotateX(lookDown, lookDown, -Math.PI * 0.2);
    const lookRight = quat.create();
    quat.rotateY(lookRight, lookRight, Math.PI * 0.4);
    const q1 = quat.create();
    const lookUp = quat.create();
    quat.rotateX(lookUp, lookUp, Math.PI * 0.3);
    quat.mul(q1, lookRight, lookDown);
    const q2 = quat.create();
    quat.mul(q2, q1, lookUp);

    const justifyRotZ = quat.create();
    quat.rotateZ(justifyRotZ, justifyRotZ, -Math.PI * 0.1);

    const q3 = quat.create();
    quat.mul(q3, q2, lookUp);
    quat.mul(q3, q3, justifyRotZ);

    function generateCore(i, animNames) {
      const center = [250, 300, 200];

      // for reproductivity, we avoid random.
      // so let's use cos + offset(salt) instead of random.
      const radius = 100 * Math.cos(i + 3) + 200;
      const yRadian = Math.cos(i + 1) * 10;
      const pos = [
        Math.cos(yRadian) * radius + center[0], 
        center[1] + 50 * Math.cos(i + 8),
        Math.sin(yRadian) * radius + center[2], 
      ];

      const scale = 0.125;
      return {
        lifeTime: Infinity,
        anim: animNames[i % animNames.length],
        properties: [
          {
            name: 'modelTranslation',
            keyFrames: [
              {time:  0, value: pos},
              {time: 15, value: [null, pos[1] + 80 * Math.abs(Math.cos(i + 11)) + 20]}
            ]
          },
          {
            name: 'modelRotation',
            keyFrames: [
              {time: 0, value: [-Math.PI * 0.5, 0, -Math.PI * 0.5]},
            ]
          },
          {
            name: 'modelScale',
            keyFrames: [
              {time: 0, value: [scale, scale, scale]},
            ]
          },
        ]
      };
    }

    return [
      parrotParticleTicker(1.5, message.str, {
        position: [-50, -20, 0],
        rotation: [-Math.PI * 0.5, 0, Math.PI * 0.5],
        anim: message.anim,
        velocity: 2,
        fly: 12,
        particleLifetime: 30,
      }),
      parrotParticleTicker(1.75, message.str, {
        position: [-25, -20, 0],
        rotation: [-Math.PI * 0.5, 0, Math.PI * 0.5],
        anim: message.anim,
        velocity: 2,
        fly: 12,
      }),
      parrotParticleTicker(2.0, message.str, {
        position: [0, -20, 0],
        rotation: [-Math.PI * 0.5, 0, Math.PI * 0.5],
        anim: message.anim,
        velocity: 2,
        fly: 12,
      }),
      parrotParticleSpawner(0, [
        parrotParticleCamera(30, [
          {
            name: 'cameraRotation',
            keyFrames: [
              {time: 0, value: [0, 0, 0, 1]},
              {time: 1, value: [0, 0, 0, 1]},
              // {time: 3, value: lookDown},
              {time: 3, value: q1},
              {time: 13, value: q1},
              {time: 14, value: q2},
              {time: 20, value: q3},
              // {time: 14, value: q3},
            ],
          },
          {
            name: 'cameraTranslation',
            keyFrames: [
              {time: 0, value: [0, 0, 100]},
              // {time: 3, value: [null, null, 130]},
              {time: 3, value: [50, 30, 90], transition: 'easeOutCubic'},
              {time: 14, value: [null, null, 40], transition: 'linear'},
             //  {time: 10, value: [50, 30, 10], transition: 'easeOutCubic'},
             //  {time: 14, value: [40, null, -30], transition: 'linear'},
            ],
          }
        ]),
      ]),
      parrotParticleSpawner(13, [
        ...parrotParticleBitmap(window.parrotPartyBitmap, {
          position: [0, 50, 0],
          velocity: [0, -5, -30],
          lifeTime: Infinity,
          motionEnd: 10,
          rotation: [Math.PI * 0.5, 0, -Math.PI * 0.5],
        }),
      ]),
      parrotParticleTicker(13, 'Fastest!!!', {
        position: [50, 30, -30],
        rotation: [-Math.PI * 0.5, 0, Math.PI * 0.5],
        anim: 'fastestparrot',
        velocity: 2,
        fly: 0,
        particleLifetime: 30,
      }),
      parrotParticleTicker(13, 'Fastest!!!', {
        position: [-30, 30, -40],
        rotation: [-Math.PI * 0.5, 0, Math.PI * 0.5],
        anim: 'fastestparrot',
        velocity: 2,
        fly: 0,
        particleLifetime: 30,
      }),
    ];
  }

  window.samples.webgl_parrot_party = parrotParticle(() => {
    const sequence = [];
    let t = 0;

    sequence.push(...parrotParticleCut(t, cut1()));
    t += 15;

    sequence.push(...parrotParticleCut(t, cut2()));
    t += 24;

    sequence.push(...parrotParticleCut(t, cut3()));
    t += 30;

    return sequence;
  }, false, 'party-bgm');
})();
