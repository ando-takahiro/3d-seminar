function parrotParticleBitmap(bitmap, options = {}) {
  const params = {
    lifeTime: 10,
    position: [0, 0, -20],
    rotation: [0, 0, 0],
    parrotSize: 3.0,

    ...options
  };

  const width = bitmap[0].length;
  const height = bitmap.length;

  function generateParrot(name, x, y) {
    const pos = [
      params.parrotSize * (x - width / 2) + params.position[0],
      params.parrotSize * (width / 2 - y) + params.position[1],
      params.position[3],
    ];
    const s = params.parrotSize / 32;
    const scale = [s, s, s];

    return {
      lifeTime: params.lifeTime,
      anim: name,
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
