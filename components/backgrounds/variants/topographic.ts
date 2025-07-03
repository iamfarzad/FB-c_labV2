import * as THREE from 'three';

export const topographicVariant = {
  init: (scene: THREE.Scene, theme: 'light' | 'dark') => {
    const contourLines: THREE.Line[] = [];
    const gridLines: THREE.Line[] = [];
    const markers: THREE.Mesh[] = [];
    const mouse = new THREE.Vector2(0, 0); // Local mouse vector

    const elevationLevels = 8;
    for (let level = 0; level < elevationLevels; level++) {
      const elevation = level * 0.5;
      const radius = 2 + level * 1.5;
      const points: THREE.Vector3[] = [];
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const variation = Math.sin(angle * 3) * 0.3 + Math.cos(angle * 5) * 0.2;
        const adjustedRadius = radius + variation;
        points.push(new THREE.Vector3(Math.cos(angle) * adjustedRadius, elevation, Math.sin(angle) * adjustedRadius));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const color = level < 2 ? 0xff5b04 : level < 5 ? 0xff8f6a : 0xf5f5f5;
      const opacity = level < 2 ? 0.9 : level < 5 ? 0.7 : 0.5;
      const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
      const line = new THREE.Line(geometry, material);
      (line as any).originalOpacity = opacity;
      (line as any).elevation = elevation;
      scene.add(line);
      contourLines.push(line);
    }
    
    const gridSize = 15;
    const gridSpacing = 2;
    for (let i = -gridSize; i <= gridSize; i += gridSpacing) {
        const hPoints = [new THREE.Vector3(-gridSize, 0, i), new THREE.Vector3(gridSize, 0, i)];
        const vPoints = [new THREE.Vector3(i, 0, -gridSize), new THREE.Vector3(i, 0, gridSize)];
        const material = new THREE.LineBasicMaterial({ color: 0x2a2a2a, transparent: true, opacity: 0.2 });
        const hLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(hPoints), material.clone());
        const vLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(vPoints), material.clone());
        scene.add(hLine, vLine);
        gridLines.push(hLine, vLine);
    }
    
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 3 + Math.random() * 8;
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xff5b04, transparent: true, opacity: 0.8 });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.set(Math.cos(angle) * radius, 2 + Math.random() * 2, Math.sin(angle) * radius);
        scene.add(marker);
        markers.push(marker);
    }

    scene.userData = { contourLines, gridLines, markers, mouse };

    return { contourLines, gridLines, markers, mouse };
  },
  animate: (
    time: number,
    targetMouse: THREE.Vector2,
    objects: {
      contourLines: THREE.Line[];
      gridLines: THREE.Line[];
      markers: THREE.Mesh[];
      mouse: THREE.Vector2;
    },
    width: number,
    height: number
  ) => {
    const { contourLines, gridLines, markers, mouse } = objects;
    
    // Smoothly update the local mouse vector
    mouse.x += (targetMouse.x - mouse.x) * 0.03;
    mouse.y += (targetMouse.y - mouse.y) * 0.03;

    contourLines.forEach((line: THREE.Line, index: number) => {
      const props = line as any;
      const breathe = Math.sin(time * 0.5 + index * 0.3) * 0.1 + 0.9;
      (line.material as THREE.LineBasicMaterial).opacity = props.originalOpacity * breathe;
      const elevationShift = Math.sin(time * 0.3 + index * 0.5) * 0.1;
      line.position.y = props.elevation + elevationShift;

      const mouseWorldX = mouse.x * 15;
      const mouseWorldZ = mouse.y * 15;
      const distanceToMouse = Math.sqrt(mouseWorldX * mouseWorldX + mouseWorldZ * mouseWorldZ);
      if (distanceToMouse < 8) {
        const influence = (8 - distanceToMouse) / 8;
        (line.material as THREE.LineBasicMaterial).opacity = Math.min(1, props.originalOpacity + influence * 0.4);
        line.position.y += influence * 0.5;
      }
    });

    gridLines.forEach((line: THREE.Line, index: number) => {
      const pulse = Math.sin(time * 1.5 + index * 0.1) * 0.1 + 0.9;
      (line.material as THREE.LineBasicMaterial).opacity = 0.2 * pulse;
    });

    markers.forEach((marker: THREE.Mesh, index: number) => {
      const float = Math.sin(time * 1.2 + index * 0.8) * 0.2;
      marker.position.y += float * 0.01;
      const pulse = Math.sin(time * 2 + index) * 0.3 + 0.7;
      (marker.material as THREE.MeshBasicMaterial).opacity = 0.8 * pulse;
    });
  },
};
