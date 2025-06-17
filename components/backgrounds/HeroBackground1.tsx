'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroBackground1() {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Clean, minimal scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    // Orthographic camera for clean geometric view
    const camera = new THREE.OrthographicCamera(
      width / -100, width / 100,
      height / 100, height / -100,
      1, 1000
    );
    camera.position.set(0, 0, 10);

    // Clean renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Create purposeful dot grid
    const dots: THREE.Mesh[] = [];
    const gridSize = 20;
    const spacing = 8;
    
    // Dot geometry and materials
    const dotGeometry = new THREE.CircleGeometry(0.15, 8);
    const primaryMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff5b04,
      transparent: true,
      opacity: 0.8
    });
    const secondaryMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff8f6a,
      transparent: true,
      opacity: 0.4
    });
    const tertiaryMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xf5f5f5,
      transparent: true,
      opacity: 0.2
    });

    // Create structured dot grid
    for (let x = -gridSize; x <= gridSize; x++) {
      for (let y = -gridSize; y <= gridSize; y++) {
        const dot = new THREE.Mesh(dotGeometry, tertiaryMaterial);
        dot.position.set(x * spacing, y * spacing, 0);
        
        // Distance-based hierarchy
        const distance = Math.sqrt(x * x + y * y);
        if (distance < 5) {
          dot.material = primaryMaterial;
          dot.scale.setScalar(1.5);
        } else if (distance < 10) {
          dot.material = secondaryMaterial;
          dot.scale.setScalar(1.2);
        }
        
        // Store original properties for animation
        (dot as any).originalScale = dot.scale.x;
        (dot as any).originalOpacity = dot.material.opacity;
        (dot as any).distance = distance;
        
        scene.add(dot);
        dots.push(dot);
      }
    }

    // Mouse interaction
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    
    function onMouseMove(event: MouseEvent) {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;
    }

    mount.addEventListener('mousemove', onMouseMove);

    // Animation loop
    function animate() {
      animationRef.current = requestAnimationFrame(animate);

      // Update mouse interaction
      raycaster.setFromCamera(mouse, camera);
      
      dots.forEach((dot) => {
        const worldPos = new THREE.Vector3();
        dot.getWorldPosition(worldPos);
        
        // Mouse proximity effect
        const mouseWorldPos = new THREE.Vector3(
          mouse.x * (width / 100),
          mouse.y * (height / 100),
          0
        );
        
        const distanceToMouse = worldPos.distanceTo(mouseWorldPos);
        const influence = Math.max(0, 1 - distanceToMouse / 20);
        
        // Scale and opacity based on mouse proximity
        const targetScale = (dot as any).originalScale * (1 + influence * 0.5);
        const targetOpacity = (dot as any).originalOpacity * (1 + influence * 0.8);
        
        dot.scale.setScalar(THREE.MathUtils.lerp(dot.scale.x, targetScale, 0.1));
        (dot.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
          (dot.material as THREE.MeshBasicMaterial).opacity,
          Math.min(targetOpacity, 1),
          0.1
        );
      });

      renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    function handleResize() {
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight;
      
      camera.left = newWidth / -100;
      camera.right = newWidth / 100;
      camera.top = newHeight / 100;
      camera.bottom = newHeight / -100;
      camera.updateProjectionMatrix();
      
      renderer.setSize(newWidth, newHeight);
    }

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      mount.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      
      // Dispose of geometries and materials
      dotGeometry.dispose();
      primaryMaterial.dispose();
      secondaryMaterial.dispose();
      tertiaryMaterial.dispose();
      
      // Remove renderer
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 w-full h-full"
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}
    />
  );
} 