import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Debounce helper function
function debounce(fn: (...args: any[]) => void, ms: number) {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null as any;
      fn.apply(this, args);
    }, ms);
  };
}

export const HeroBackground3 = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    
    const currentMount = mountRef.current;
    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, grid: THREE.GridHelper, clock: THREE.Clock;
    let animationFrameId: number;

    const init = () => {
      scene = new THREE.Scene();
      clock = new THREE.Clock();
      camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
      camera.position.set(0, 0, 10);

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      currentMount.appendChild(renderer.domElement);

      grid = new THREE.GridHelper(100, 50, 0xff5b04, 0x2a2a2a);
      (grid.material as THREE.Material).transparent = true;
      (grid.material as THREE.Material).opacity = 0.2;
      scene.add(grid);

      window.addEventListener('resize', handleResize);
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      
      if (grid) {
        grid.position.z = (elapsedTime * 0.5) % 4;
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };

    const handleResize = debounce(() => {
      if (!camera || !renderer) return;
      
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }, 150);

    init();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      if (currentMount && renderer) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, backgroundColor: 'var(--bg-secondary)' }} />;
};

export default HeroBackground3;
