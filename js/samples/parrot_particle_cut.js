function parrotParticleCut(start, generators) {
  return generators.map(gen => ({...gen, begin: gen.begin + start, end: gen.end + start}));
}
