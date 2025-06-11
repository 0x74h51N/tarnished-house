export function addRoots(A, B, aPos, aRot, bPos, bRot, scale = 2, group) {
  A.position.set(...aPos);
  A.rotation.set(...aRot);
  A.scale.setScalar(scale);
  A.castShadow = true;

  B.position.set(...bPos);
  B.rotation.set(...bRot);
  B.scale.setScalar(scale);
  B.castShadow = true;
  B.receiveShadow = true;

  group.add(A, B);
}
