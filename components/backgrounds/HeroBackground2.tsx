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

export const HeroBackground2 = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    
    const currentMount = mountRef.current;
    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
    let plane: THREE.Mesh, clock: THREE.Clock, animationFrameId: number;
    let mousePosition = { x: 0, y: 0 };
    
    const init = () => {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);
      scene.fog = new THREE.Fog(0x0a0a0a, 1, 20);
      
      clock = new THREE.Clock();
      camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
      camera.position.set(0, 3, 5);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      currentMount.appendChild(renderer.domElement);

      // Enhanced wave plane with higher resolution
      const planeGeometry = new THREE.PlaneGeometry(20, 20, 100, 100);
      
      // Create gradient material
      const planeMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          mouse: { value: new THREE.Vector2(0, 0) },
          color1: { value: new THREE.Color(0xff5b04) },
          color2: { value: new THREE.Color(0x8b5cf6) },
          color3: { value: new THREE.Color(0x06b6d4) }
        },
        vertexShader: `
          uniform float time;
          uniform vec2 mouse;
          varying vec3 vPosition;
          varying float vElevation;
          
          void main() {
            vec4 modelPosition = modelMatrix * vec4(position, 1.0);
            
            // Multiple wave layers for complexity
            float elevation = sin(modelPosition.x * 0.3 + time * 0.8) * 0.5;
            elevation += sin(modelPosition.z * 0.4 + time * 1.2) * 0.3;
            elevation += sin(modelPosition.x * 0.8 + modelPosition.z * 0.6 + time * 2.0) * 0.2;
            
            // Mouse interaction
            float mouseInfluence = 1.0 - distance(modelPosition.xz, mouse * 10.0) * 0.1;
            elevation += mouseInfluence * 0.5;
            
            modelPosition.y += elevation;
            
            vPosition = modelPosition.xyz;
            vElevation = elevation;
            
            gl_Position = projectionMatrix * viewMatrix * modelPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 color1;
          uniform vec3 color2;
          uniform vec3 color3;
          varying vec3 vPosition;
          varying float vElevation;
          
          void main() {
            // Color based on elevation and position
            vec3 color = mix(color1, color2, vElevation + 0.5);
            color = mix(color, color3, abs(sin(vPosition.x * 0.1)) * 0.3);
            
            // Add some transparency based on elevation
            float alpha = 0.6 + vElevation * 0.4;
            
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        wireframe: false,
        side: THREE.DoubleSide
      });

      plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.x = -Math.PI / 2;
      scene.add(plane);

      // Add ambient lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
      scene.add(ambientLight);

      // Add point light that follows mouse
      const pointLight = new THREE.PointLight(0xff5b04, 1, 10);
      pointLight.position.set(0, 2, 0);
      scene.add(pointLight);
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('mousemove', handleMouseMove);
    };

    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      
      if (plane && plane.material instanceof THREE.ShaderMaterial) {
        // Update shader uniforms
        plane.material.uniforms.time.value = elapsedTime;
        plane.material.uniforms.mouse.value.set(mousePosition.x, mousePosition.y);
        
        // Gentle rotation
        plane.rotation.z = Math.sin(elapsedTime * 0.1) * 0.05;
      }

      // Dynamic camera movement
      camera.position.x = Math.sin(elapsedTime * 0.1) * 2;
      camera.position.z = 5 + Math.cos(elapsedTime * 0.15) * 2;
      camera.lookAt(0, 0, 0);

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
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      
      if (currentMount && renderer) {
        currentMount.removeChild(renderer.domElement);
      }
      
      // Cleanup
      if (plane) {
        scene.remove(plane);
        plane.geometry.dispose();
        if (plane.material instanceof THREE.ShaderMaterial) {
          plane.material.dispose();
        }
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, backgroundColor: 'var(--bg-secondary)' }} />;
};

export default HeroBackground2;
