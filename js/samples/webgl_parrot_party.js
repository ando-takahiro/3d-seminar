(function() {
  function cut1() {
    return [
      parrotParticleSpawner(0, [
        introCharacter('parrot', 16),
        introCharacter('lptm', -16),
      ]),
      parrotParticleSpawner(5.0, [
        introCharacter('parrot', -8, -8),
        introCharacter('lptm', 20, -20),
      ]),
      parrotParticleSpawner(6.0, [
        introCharacter('parrot', 10, -5),
        introCharacter('lptm', -30, -200),
      ]),
      parrotParticleTicker(0.0, 'PARTY OR DIE'),
    ];
  }

  function cut2() {
    const excludeAnims = [
      'gpuconcernedparrot',
      'parrotdad',
      'fastparrot',
      'fasterparrot',
      'fastestparrot',
    ];
    const animNames = Object.keys(window.anims).
      filter(name => excludeAnims.indexOf(name) < 0);
    const center = [0, 0, 100];
    const particles = [];

    for (let i = 0; i < 100; i++) {
      // for reproductivity, we avoid random.
      // so let's use cos + offset(salt) instead of random.
      const radius = 100 * Math.cos(i + 3) + 300;
      const yRadian = Math.cos(i + 1) * 10;
      const xRadian = Math.cos(i + 4) * 40 % (Math.PI * 0.25);
      const pos = [
        Math.cos(yRadian) * Math.cos(xRadian) * radius + center[0], 
        Math.sin(xRadian) * radius + center[1],
        Math.sin(yRadian) * Math.cos(xRadian) * radius + center[2], 
      ];

      const scale = 1.0;

      particles.push({
        lifeTime: 15.0,
        anim: animNames[i % animNames.length],
        properties: [
          {
            name: 'modelTranslation',
            keyFrames: [
              {time:  0, value: pos},
              {time:  5, value: [null, pos[1] + 10 * Math.cos(i + 11)]},
              {time: 10, value: [null, pos[1] + 10 * Math.cos(i + 11)]},
              {time: 15, value: pos},
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
              {time: 12, value: null},
              {time: 15, value: [100], transition: 'easeInCubic'},
            ]
          },
          {
            name: 'voxelRotation',
            keyFrames: [
              {time: 0, value: [100, 200]},
              {time: 3, value: [0, 0], transition: 'easeOutCubic'},
              {time: 12, value: null},
              {time: 15, value: [100], transition: 'easeInCubic'},
            ]
          }
        ]
      });
    }

    return [
      parrotParticleSpawner(0, [
        parrotParticleCamera(15.0, [
          {
            name: 'cameraRotation',
            keyFrames: [
              {time: 0, value: [0, 0]},
              {time: 15, value: [0, -4 * Math.PI]},
            ],
          },
          {
            name: 'cameraTranslation',
            keyFrames: [
              {time: 0, value: center},
            ],
          }
        ]),
        ...particles
      ]),
      parrotParticleTicker(0.0, 'GPU! GPU! GPU! GPU!'),
    ];
  }

  function cut3() {
    const center = [0, 0, 100];
    const bitmap = [
      ['parrot', null],
      ['sirocco', 'loveparrot'],
    ];

    const lookDown = quat.create();
    quat.rotateX(lookDown, lookDown, -Math.PI * 0.2);
    const lookRight = quat.create();
    quat.rotateY(lookRight, lookRight, Math.PI * 0.4);
    const rotRight = quat.create();
    quat.rotateZ(rotRight, rotRight, Math.PI * 0.4);
    const q1 = quat.create();
    quat.mul(q1, lookDown, lookDown);
    // quat.mul(q1, rotRight, lookDown);
    quat.mul(q1, lookRight, lookDown);
    return [
      parrotParticleTicker(0.0, 'More speed... Fast! Faster!! FASTEST!!!', {
        position: [0, -20, 50],
        rotation: [-Math.PI * 0.5, 0, Math.PI * 0.5],
      }),
      parrotParticleSpawner(0, parrotParticleBitmap(bitmap)),
      parrotParticleSpawner(0, [
        parrotParticleCamera(15.0, [
          {
            name: 'cameraRotation',
            keyFrames: [
              {time: 0, value: [0, 0, 0, 1]},
              {time: 1, value: [0, 0, 0, 1]},
              // {time: 3, value: lookDown},
              {time: 3, value: q1},
            ],
          },
          {
            name: 'cameraTranslation',
            keyFrames: [
              {time: 0, value: center},
              // {time: 3, value: [null, null, 130]},
              {time: 3, value: [40, 20, 130]},
              {time: 14, value: [null, null, 240], transition: 'linear'},
            ],
          }
        ]),
      ]),
      parrotParticleTicker(0.0, 'GPU! GPU! GPU! GPU!'),
    ];
  }

  window.samples.webgl_parrot_party = parrotParticle(() => {
    const sequence = [];
    let t = 0;

    // sequence.push(...parrotParticleCut(t, cut1());
    // t += 13;

    // sequence.push(...parrotParticleCut(t, cut2()));
    // t += 15;

    sequence.push(...parrotParticleCut(t, cut3()));
    t += 30;

    return sequence;
  }, false, 'party-bgm');
})();
