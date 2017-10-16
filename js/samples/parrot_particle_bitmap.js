function parrotParticleBitmap(bitmap, options = {}) {
  const params = {
    lifeTime: 10,
    motionEnd: 10,
    position: [0, 0, -20],
    velocity: [0, 0, 0],
    rotation: [0, 0, 0],
    parrotSize: 3.0,

    ...options
  };

  const width = bitmap[0].length;
  const height = bitmap.length;

  function generateParrot(name, x, y) {
    const randValue = Math.cos(x * 3 + y + 17) * 0.1;

    const baseLocal = [
      params.parrotSize * (x - width / 2),
      params.parrotSize * (width / 2 - y),
      0.0
    ];
    const fromLocal = baseLocal.map((f, i) => f - params.velocity[i] * randValue);
    const orgParrotSize = 32;
    const s = params.parrotSize / orgParrotSize;
    const scale = [s, s, s];

    const model = makeModelMatrix(params.position, params.rotation);

    const from = vec3.create();
    vec3.transformMat4(from, fromLocal, model);

    const toLocal = baseLocal.map((f, i) => f + params.velocity[i] * params.motionEnd);
    const to = vec3.create();
    vec3.transformMat4(to, toLocal, model);

    return {
      lifeTime: params.lifeTime,
      anim: name,
      properties: [
        {
          name: 'modelTranslation',
          keyFrames: [
            {time: 0, value: from},
            {time: params.motionEnd, value: to},
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
            {time: 0, value: scale},
          ]
        }
      ]
    };
  }

  const result = [];

  bitmap.forEach((row, y) => {
    row.forEach((name, x) => {
      if (name) {
        result.push(generateParrot(name, x, y));
      }
    });
  });

  return result;
}
