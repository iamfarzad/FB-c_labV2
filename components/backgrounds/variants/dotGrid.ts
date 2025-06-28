import * as THREE from 'three';

export const dotGridVariant = {
  init: (scene: THREE.Scene, theme: 'light' | 'dark') => {
    const dots: THREE.Mesh[] = [];
    const gridSize = 20;
    const spacing = 8;

    const dotGeometry = new THREE.CircleGeometry(0.15, 8);
    const primaryMaterial = new THREE.MeshBasicMaterial({ color: 0xff5b04, transparent: true, opacity: 0.8 });
    const secondaryMaterial = new THREE.MeshBasicMaterial({ color: 0xff8f6a, transparent: true, opacity: 0.4 });
    const tertiaryMaterial = new THREE.MeshBasicMaterial({ color: 0xf5f5f5, transparent: true, opacity: 0.2 });

    for (let x = -gridSize; x <= gridSize; x++) {
      for (let y = -gridSize; y <= gridSize; y++) {
        const dot = new THREE.Mesh(dotGeometry, tertiaryMaterial);
        dot.position.set(x * spacing, y * spacing, 0);

        const distance = Math.sqrt(x * x + y * y);
        if (distance < 5) {
          dot.material = primaryMaterial;
          dot.scale.setScalar(1.5);
        } else if (distance < 10) {
          dot.material = secondaryMaterial;
          dot.scale.setScalar(1.2);
        }

        (dot as any).originalScale = dot.scale.x;
        (dot as any).originalOpacity = (dot.material as THREE.MeshBasicMaterial).opacity;
        scene.add(dot);
        dots.push(dot);
      }
    }

    scene.userData.dots = dots;

    return { dots };
  },
  animate: (time: number, mouse: THREE.Vector2, objects: { dots: THREE.Mesh[] }, width: number, height: number) => {
    const { dots } = objects;
    if (!dots) return;

    dots.forEach((dot: THREE.Mesh) => {
      const worldPos = new THREE.Vector3();
      dot.getWorldPosition(worldPos);

      const orthographicMouse = new THREE.Vector3(mouse.x * (width / 100), mouse.y * (height / 100), 0);
      const distanceToMouse = worldPos.distanceTo(orthographicMouse);
      const influence = Math.max(0, 1 - distanceToMouse / 20);

      const targetScale = (dot as any).originalScale * (1 + influence * 0.5);
      const targetOpacity = (dot as any).originalOpacity * (1 + influence * 0.8);

      dot.scale.setScalar(THREE.MathUtils.lerp(dot.scale.x, targetScale, 0.1));
      (dot.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
        (dot.material as THREE.MeshBasicMaterial).opacity,
        Math.min(targetOpacity, 1),
        0.1
      );
    });
  },
}; 