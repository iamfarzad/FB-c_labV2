'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroBackground2() {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Clean topographic scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    // Isometric camera for map-like view
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 25, 25);
    camera.lookAt(0, 0, 0);

    // Clean renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Topographic contour lines
    const contourLines: THREE.Line[] = [];
    const elevationLevels = 8;
    const mapSize = 20;

    // Create elevation contours
    for (let level = 0; level < elevationLevels; level++) {
      const elevation = level * 0.5;
      const radius = 2 + level * 1.5;
      
      // Create contour ring
      const points: THREE.Vector3[] = [];
      const segments = 64;
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        
        // Add some organic variation to make it less perfect
        const variation = Math.sin(angle * 3) * 0.3 + Math.cos(angle * 5) * 0.2;
        const adjustedRadius = radius + variation;
        
        const x = Math.cos(angle) * adjustedRadius;
        const z = Math.sin(angle) * adjustedRadius;
        
        points.push(new THREE.Vector3(x, elevation, z));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      
      // Color based on elevation
      let color, opacity;
      if (level < 2) {
        color = 0xff5b04; // Orange accent for low elevations
        opacity = 0.9;
      } else if (level < 5) {
        color = 0xff8f6a; // Orange light for mid elevations
        opacity = 0.7;
      } else {
        color = 0xf5f5f5; // Light silver for high elevations
        opacity = 0.5;
      }
      
      const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity
      });
      
      const line = new THREE.Line(geometry, material);
      
      // Store properties
      (line as any).originalOpacity = opacity;
      (line as any).elevation = elevation;
      (line as any).level = level;
      
      scene.add(line);
      contourLines.push(line);
    }

    // Grid reference lines
    const gridLines: THREE.Line[] = [];
    const gridSize = 15;
    const gridSpacing = 2;
    
    // Horizontal grid lines
    for (let i = -gridSize; i <= gridSize; i += gridSpacing) {
      const points = [
        new THREE.Vector3(-gridSize, 0, i),
        new THREE.Vector3(gridSize, 0, i)
      ];
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x2a2a2a,
        transparent: true,
        opacity: 0.2
      });
      
      const line = new THREE.Line(geometry, material);
      scene.add(line);
      gridLines.push(line);
    }
    
    // Vertical grid lines
    for (let i = -gridSize; i <= gridSize; i += gridSpacing) {
      const points = [
        new THREE.Vector3(i, 0, -gridSize),
        new THREE.Vector3(i, 0, gridSize)
      ];
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x2a2a2a,
        transparent: true,
        opacity: 0.2
      });
      
      const line = new THREE.Line(geometry, material);
      scene.add(line);
      gridLines.push(line);
    }

    // Elevation markers (small dots at peak points)
    const markers: THREE.Mesh[] = [];
    
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const radius = 3 + Math.random() * 8;
      
      const geometry = new THREE.SphereGeometry(0.1, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: 0xff5b04,
        transparent: true,
        opacity: 0.8
      });
      
      const marker = new THREE.Mesh(geometry, material);
      marker.position.set(
        Math.cos(angle) * radius,
        2 + Math.random() * 2,
        Math.sin(angle) * radius
      );
      
      scene.add(marker);
      markers.push(marker);
    }

    // Mouse interaction
    const mouse = { x: 0, y: 0 };
    const targetMouse = { x: 0, y: 0 };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      targetMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    let time = 0;

    // Topographic animation
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      time += 0.008;

      // Smooth mouse interpolation
      mouse.x += (targetMouse.x - mouse.x) * 0.03;
      mouse.y += (targetMouse.y - mouse.y) * 0.03;

      // Animate contour lines (subtle elevation changes)
      contourLines.forEach((line, index) => {
        const props = line as any;
        
        // Subtle breathing effect
        const breathe = Math.sin(time * 0.5 + index * 0.3) * 0.1 + 0.9;
        (line.material as THREE.LineBasicMaterial).opacity = props.originalOpacity * breathe;
        
        // Slight vertical movement to simulate data changes
        const elevationShift = Math.sin(time * 0.3 + index * 0.5) * 0.1;
        line.position.y = props.elevation + elevationShift;
        
        // Mouse proximity effect
        const mouseWorldX = mouse.x * 15;
        const mouseWorldZ = mouse.y * 15;
        const distanceToMouse = Math.sqrt(mouseWorldX * mouseWorldX + mouseWorldZ * mouseWorldZ);
        
        if (distanceToMouse < 8) {
          const influence = (8 - distanceToMouse) / 8;
          (line.material as THREE.LineBasicMaterial).opacity = Math.min(1, props.originalOpacity + influence * 0.4);
          line.position.y += influence * 0.5;
        }
      });

      // Animate grid lines
      gridLines.forEach((line, index) => {
        const pulse = Math.sin(time * 1.5 + index * 0.1) * 0.1 + 0.9;
        (line.material as THREE.LineBasicMaterial).opacity = 0.2 * pulse;
      });

      // Animate markers
      markers.forEach((marker, index) => {
        // Gentle floating
        const float = Math.sin(time * 1.2 + index * 0.8) * 0.2;
        marker.position.y += float * 0.01;
        
        // Pulsing
        const pulse = Math.sin(time * 2 + index) * 0.3 + 0.7;
        (marker.material as THREE.MeshBasicMaterial).opacity = 0.8 * pulse;
      });

      // Responsive camera movement
      camera.position.x = mouse.x * 8;
      camera.position.z = 25 + mouse.y * 5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    // Handle resize
    const handleResize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    mount.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      mount.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      
      // Cleanup
      [...contourLines, ...gridLines].forEach(line => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
      
      markers.forEach(marker => {
        marker.geometry.dispose();
        (marker.material as THREE.Material).dispose();
      });
      
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full relative overflow-hidden"
      style={{ 
        minHeight: '400px',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
      }}
    />
  );
}
