(function() {
  window.samples.webgl_parrot_party = parrotParticle(() => {
    const sequence = [];
    let t = 0;

    // part 1
    /*sequence.push(
      ...parrotParticleCut(t, [
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
      ])
    );
    t += 15;
    */

    // scene2
    sequence.push(
      ...parrotParticleCut(t, [
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
                {time: 0, value: [0, 0, 100]},
              ],
            }
          ]),
        ]),
        parrotParticleTicker(0.0, 'scene 2'),
      ])
    );
    t += 15;

    // scene3
    sequence.push(
      ...parrotParticleCut(t, [
        parrotParticleTicker(0.0, 'more speed... fast! fastER!! fastEST!!!'),
      ])
    );
    t += 30;

    return sequence;
  }, false, 'party-bgm');
})();
