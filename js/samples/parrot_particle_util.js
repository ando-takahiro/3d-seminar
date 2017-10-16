function makeModelMatrix(translation, rotation, scale) {
  const model = mat4.create();

  if (translation) {
    mat4.translate(model, model, translation);
  }
  if (rotation) {
    mat4.rotateX(model, model, rotation[0]);
    mat4.rotateY(model, model, rotation[1]);
    mat4.rotateZ(model, model, rotation[2]);
  }
  if (scale) {
    mat4.scale(model, model, scale);
  }

  return model;
}

function makeViewMatrix(translation, rotation) {
  let view;
  if (rotation && rotation.length === 4) {
    view = mat4.create();
    mat4.fromRotationTranslationScale(view, rotation, translation || [0, 0, 0], [1, 1, 1]);
  } else {
    view = makeModelMatrix(translation, rotation);
  }

  mat4.invert(view, view);

  return view;
}
