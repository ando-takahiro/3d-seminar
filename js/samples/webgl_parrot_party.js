(function() {
  window.samples.webgl_parrot_party = parrotParticle(() => [
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
  ], false, 'party-bgm');
})();
