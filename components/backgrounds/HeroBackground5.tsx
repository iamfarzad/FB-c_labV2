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

export const HeroBackground5 = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    
    const currentMount = mountRef.current;
    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, clock: THREE.Clock;
    let animationFrameId: number;
    
    // TODO: Implement custom background 5
    const init = () => {
      scene = new THREE.Scene();
      clock = new THREE.Clock();
      camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      currentMount.appendChild(renderer.domElement);
      
      // Placeholder: Add a simple sphere
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshBasicMaterial({ 
        color: 0x0095ff,
        wireframe: true 
      });
      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);
      
      window.addEventListener('resize', handleResize);
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Rotate the sphere
      const sphere = scene?.children[0] as THREE.Mesh;
      if (sphere) {
        sphere.rotation.x += 0.005;
        sphere.rotation.y += 0.01;
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

export default HeroBackground5;
