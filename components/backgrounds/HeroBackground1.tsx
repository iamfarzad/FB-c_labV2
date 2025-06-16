import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

interface HeroBackground1Props {
  theme?: 'light' | 'dark';
  className?: string;
}

// Debounce helper function
function debounce<T extends (...args: any[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return function(...args: Parameters<T>) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export const HeroBackground1: React.FC<HeroBackground1Props> = ({ 
  theme = 'dark',
  className = '' 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const targetMousePosition = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  // Theme colors
  const themeColors = useMemo(() => ({
    light: {
      primary: 0x6d28d9, // Purple
      secondary: 0xec4899, // Pink
      accent: 0x8b5cf6, // Light purple
      bg: 0xf8fafc, // Light gray
    },
    dark: {
      primary: 0x8b5cf6, // Light purple
      secondary: 0xf472b6, // Light pink
      accent: 0x06b6d4, // Dark blue
      bg: 0x0f172a, // Dark blue
    },
  }), []);

  const currentColors = themeColors[theme];

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    const { clientWidth, clientHeight } = currentMount;

    // Scene with fog for depth
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(currentColors.bg);
    scene.fog = new THREE.Fog(currentColors.bg, 10, 50);
    sceneRef.current = scene;

    // Camera with better positioning
    const camera = new THREE.PerspectiveCamera(60, clientWidth / clientHeight, 0.1, 100);
    camera.position.set(0, 0, 30);
    cameraRef.current = camera;

    // Enhanced renderer with better settings
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(clientWidth, clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    currentMount.appendChild(renderer.domElement);

    // Enhanced particle system
    const particleCount = 3000;
    const particlesGeometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);
    
    const color = new THREE.Color();
    const radius = 25;
    
    for (let i = 0; i < particleCount; i++) {
      // Position
      const i3 = i * 3;
      
      // More natural distribution
      const r = radius * Math.pow(Math.random(), 0.7);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);
      
      // Enhanced color gradient with three colors
      const gradient = Math.random();
      if (gradient < 0.33) {
        color.lerpColors(
          new THREE.Color(currentColors.primary),
          new THREE.Color(currentColors.secondary),
          gradient * 3
        );
      } else if (gradient < 0.66) {
        color.lerpColors(
          new THREE.Color(currentColors.secondary),
          new THREE.Color(currentColors.accent),
          (gradient - 0.33) * 3
        );
      } else {
        color.lerpColors(
          new THREE.Color(currentColors.accent),
          new THREE.Color(currentColors.primary),
          (gradient - 0.66) * 3
        );
      }
      
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      // Variable sizes based on distance
      const distance = Math.sqrt(positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2);
      sizes[i] = (0.5 + 2 * Math.random()) * (1 - distance / radius * 0.5);
      
      // Random velocities for floating effect
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    
    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    particlesGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
    
    // Enhanced material with custom shader
    const particlesMaterial = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      alphaTest: 0.001,
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Smooth mouse tracking
    const handleMouseMove = (event: MouseEvent) => {
      targetMousePosition.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      };
    };

    const handleResize = debounce(() => {
      if (!camera || !renderer) return;
      
      const { clientWidth, clientHeight } = currentMount;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    }, 100);

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      const elapsedTime = clockRef.current.getElapsedTime();
      const particles = particlesRef.current;
      
      if (particles) {
        // Smooth mouse interpolation
        mousePosition.current.x += (targetMousePosition.current.x - mousePosition.current.x) * 0.02;
        mousePosition.current.y += (targetMousePosition.current.y - mousePosition.current.y) * 0.02;
        
        // Enhanced rotation with multiple axes
        particles.rotation.y = elapsedTime * 0.05;
        particles.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1;
        particles.rotation.z = Math.cos(elapsedTime * 0.08) * 0.05;
        
        // Floating particle animation
        const positions = particles.geometry.attributes.position as THREE.BufferAttribute;
        const velocities = particles.geometry.attributes.velocity as THREE.BufferAttribute;
        
        for (let i = 0; i < positions.count; i++) {
          const i3 = i * 3;
          
          // Apply floating motion
          positions.setX(i, positions.getX(i) + velocities.getX(i));
          positions.setY(i, positions.getY(i) + velocities.getY(i));
          positions.setZ(i, positions.getZ(i) + velocities.getZ(i));
          
          // Boundary checking and velocity reversal
          if (Math.abs(positions.getX(i)) > 25) velocities.setX(i, -velocities.getX(i));
          if (Math.abs(positions.getY(i)) > 25) velocities.setY(i, -velocities.getY(i));
          if (Math.abs(positions.getZ(i)) > 25) velocities.setZ(i, -velocities.getZ(i));
        }
        
        positions.needsUpdate = true;
        
        // Enhanced camera movement
        if (cameraRef.current) {
          cameraRef.current.position.x += (mousePosition.current.x * 3 - cameraRef.current.position.x) * 0.01;
          cameraRef.current.position.y += (mousePosition.current.y * 3 - cameraRef.current.position.y) * 0.01;
          cameraRef.current.lookAt(scene.position);
        }
      }
      
      renderer.render(scene, camera);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      
      if (particlesRef.current) {
        scene.remove(particlesRef.current);
        particlesRef.current.geometry.dispose();
        (particlesRef.current.material as THREE.Material).dispose();
      }
      
      renderer.dispose();
    };
  }, [currentColors]);

  return (
    <div 
      ref={mountRef} 
      className={`absolute inset-0 -z-10 ${className}`}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    />
  );
};

export default HeroBackground1;
