function parrotParticleSpawner(time, objects) {
  return {
    begin: time,
    end: time,
    eval: () => objects,
  };
}
