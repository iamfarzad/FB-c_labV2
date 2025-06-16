import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Debounce helper function
function debounce(fn: (...args: any[]) => void, ms: number) {
  let timer: NodeJS.Timeout | null = null;
  return (...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(null, args);
    }, ms);
  };
}

export const HeroBackground4 = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    if (!mountRef.current) return;
    
    const currentMount = mountRef.current;
    if (!currentMount) return;
    
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let clock: THREE.Clock | null = null;
    let animationFrameId: number | null = null;
    let cube: THREE.Mesh | null = null;
    
    const init = () => {
      if (!currentMount) return;
      
      scene = new THREE.Scene();
      clock = new THREE.Clock();
      
      const width = currentMount.clientWidth;
      const height = currentMount.clientHeight || 1; // Ensure height is at least 1
      
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true 
      });
      
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      // Clear previous renderer if it exists
      while (currentMount.firstChild) {
        currentMount.removeChild(currentMount.firstChild);
      }
      
      currentMount.appendChild(renderer.domElement);
      
      // Add a simple rotating cube
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        wireframe: true 
      });
      cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      
      const handleResize = debounce(() => {
        if (!camera || !renderer || !currentMount) return;
        
        const width = currentMount.clientWidth;
        const height = currentMount.clientHeight || 1;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }, 250);
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup function for the resize event
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Rotate the cube
      const cube = scene?.children[0] as THREE.Mesh;
      if (cube) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
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

export default HeroBackground4;
