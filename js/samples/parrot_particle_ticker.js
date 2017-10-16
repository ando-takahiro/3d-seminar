function parrotParticleTicker(begin, str, options = {}) {
  const params = {
    // default params
    velocity: 1, // character numbers per second
    anim: 'parrot',
    generatorLifeTime: str.length * 2.0 + 3,
    particleLifeTime: 10.0,
    position: [40, 0, -20],
    rotation: [0, 0, 0],
    parrotSize: 3.0,
    fly: Infinity, // time(age) to fly
    flySpeed: 30,

    ...options
  };

  const animations = Array.isArray(params.anim) ?
    params.anim :
    _.range(str.length).map(() => params.anim);

  const velocity = params.velocity * params.parrotSize * 8; // character numbers to unit
  const orgParrotSize = 32;
  const parrotScale = params.parrotSize / orgParrotSize;
  const generationCycle = params.parrotSize / velocity;
  const totalColumns = 8 * str.length;
  let age = 0;
  let bornTime = 0;
  let lastTime = -1;
  let accumTime = 0;
  let currentIndex = 0;

  function generateParrot(x, y, anim) {
    const fadeTime = 1.0;
    const walkTime = params.parrotLifeTime - fadeTime * 2;
    const lifeTime = params.particleLifeTime;

    const model = makeModelMatrix(params.position, params.rotation);

    const fromLocal = [
      -x * params.parrotSize,
      y * params.parrotSize,
      0
    ];
    const from = vec3.create();
    vec3.transformMat4(from, fromLocal, model);

    const toLocal = [...fromLocal];
    toLocal[0] -= velocity * lifeTime;
    const to = vec3.create();
    vec3.transformMat4(to, toLocal, model);

    let flyFn;
    if (age + lifeTime >= params.fly) {
      const flyTime = params.fly + Math.cos(age + currentIndex + y) * 2;
      flyFn = function flyer(particle, time) {
        const localTime = time - bornTime;
        if (localTime > flyTime) {
          particle.modelTranslation[1] += (localTime - flyTime) * params.flySpeed;
        }
      }
    }

    return {
      lifeTime: lifeTime,
      anim: anim,
      eval: flyFn,
      animOffset: totalColumns - currentIndex,
      properties: [
        {
          name: 'modelTranslation',
          keyFrames: [
            {time: 0, value: from},
            {time: lifeTime, value: to, transition: 'linear'},
          ]
        },
        {
          name: 'modelRotation',
          keyFrames: [
            {time: 0, value: params.rotation},
          ]
        },
        {
          name: 'modelScale',
          keyFrames: [
            {time: 0, value: [0, 0, 0]},
            {time: fadeTime, value: [parrotScale, parrotScale, parrotScale], transition: 'easeOutElastic'},
            {time: lifeTime - fadeTime, value: null},
            {time: lifeTime, value: [0, 0, 0], transition: 'easeInElastic'},
          ]
        },
        {
          name: 'voxelRotation',
          keyFrames: [
            {time: 0, value: [2, 4]},
            {time: fadeTime, value: [0, 0]},
            {time: lifeTime - fadeTime, value: null},
            {time: lifeTime, value: [-2, -4]},
          ]
        },
      ]
    };
  }

  function generateColumn(offset) {
    const charPos = Math.floor(currentIndex / 8);
    const code = str.charCodeAt(charPos);
    const basePos = 8 * code;
    const result = [];
    const x = currentIndex % 8;
    for (let i = 0; i < 8; i++) {
      if (window.font8x8[basePos + i] & (1 << (7 - x))) {
        result.push(generateParrot(offset, 4 - i, animations[charPos]));
      }
    }

    ++currentIndex;

    return result;
  }

  function eval(time) {
    let result = [];
    if (lastTime < 0) {
      bornTime = time;
      result.push(...generateColumn(0));
    } else {
      const diffTime = time - lastTime;
      accumTime += diffTime;
      age += diffTime;
      const generateCount = Math.floor(accumTime / generationCycle);

      for (let i = 0; i < generateCount; i++) {
        result.push(...generateColumn(generateCount - i - 1));
      }

      accumTime -= generateCount * generationCycle;
    }

    lastTime = time;
    return result;
  }

  return {
    begin: begin,
    end: begin + params.generatorLifeTime,
    eval: eval,
  };
}
