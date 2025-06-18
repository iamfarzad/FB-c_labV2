'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroBackground3() {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Clean architectural scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    // Perspective camera for architectural depth
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 8, 20);
    camera.lookAt(0, 0, 0);

    // Clean renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Architectural grid system with purpose
    const gridLines: THREE.Line[] = [];
    
    // Main structural grid
    const mainGridSize = 20;
    const mainSpacing = 2;
    
    // Horizontal lines
    for (let i = -mainGridSize; i <= mainGridSize; i++) {
      const points = [
        new THREE.Vector3(-mainGridSize * mainSpacing, 0, i * mainSpacing),
        new THREE.Vector3(mainGridSize * mainSpacing, 0, i * mainSpacing)
      ];
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: i === 0 ? 0xff5b04 : 0x2a2a2a, // Orange accent for center line
        transparent: true,
        opacity: i === 0 ? 0.8 : 0.3
      });
      
      const line = new THREE.Line(geometry, material);
      scene.add(line);
      gridLines.push(line);
    }
    
    // Vertical lines
    for (let i = -mainGridSize; i <= mainGridSize; i++) {
      const points = [
        new THREE.Vector3(i * mainSpacing, 0, -mainGridSize * mainSpacing),
        new THREE.Vector3(i * mainSpacing, 0, mainGridSize * mainSpacing)
      ];
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: i === 0 ? 0xff5b04 : 0x2a2a2a, // Orange accent for center line
        transparent: true,
        opacity: i === 0 ? 0.8 : 0.3
      });
      
      const line = new THREE.Line(geometry, material);
      scene.add(line);
      gridLines.push(line);
    }

    // Secondary detail grid (finer)
    const detailSpacing = 0.5;
    const detailSize = 10;
    
    for (let i = -detailSize; i <= detailSize; i++) {
      if (i % 4 === 0) continue; // Skip where main grid exists
      
      // Horizontal detail lines
      const hPoints = [
        new THREE.Vector3(-detailSize * detailSpacing, 0, i * detailSpacing),
        new THREE.Vector3(detailSize * detailSpacing, 0, i * detailSpacing)
      ];
      
      const hGeometry = new THREE.BufferGeometry().setFromPoints(hPoints);
      const hMaterial = new THREE.LineBasicMaterial({
        color: 0x1a1a1a,
        transparent: true,
        opacity: 0.15
      });
      
      const hLine = new THREE.Line(hGeometry, hMaterial);
      scene.add(hLine);
      gridLines.push(hLine);
      
      // Vertical detail lines
      const vPoints = [
        new THREE.Vector3(i * detailSpacing, 0, -detailSize * detailSpacing),
        new THREE.Vector3(i * detailSpacing, 0, detailSize * detailSpacing)
      ];
      
      const vGeometry = new THREE.BufferGeometry().setFromPoints(vPoints);
      const vMaterial = new THREE.LineBasicMaterial({
        color: 0x1a1a1a,
        transparent: true,
        opacity: 0.15
      });
      
      const vLine = new THREE.Line(vGeometry, vMaterial);
      scene.add(vLine);
      gridLines.push(vLine);
    }

    // Architectural accent elements
    const accentElements: THREE.Mesh[] = [];
    
    // Corner markers
    const cornerPositions = [
      [-15, 0, -15], [15, 0, -15], [-15, 0, 15], [15, 0, 15]
    ];
    
    cornerPositions.forEach(pos => {
      const geometry = new THREE.RingGeometry(0.3, 0.5, 8);
      const material = new THREE.MeshBasicMaterial({
        color: 0xff8f6a,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      
      const ring = new THREE.Mesh(geometry, material);
      ring.position.set(pos[0], pos[1], pos[2]);
      ring.rotation.x = -Math.PI / 2;
      scene.add(ring);
      accentElements.push(ring);
    });

    // Center focal point
    const centerGeometry = new THREE.RingGeometry(0.8, 1.2, 16);
    const centerMaterial = new THREE.MeshBasicMaterial({
      color: 0xff5b04,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    
    const centerRing = new THREE.Mesh(centerGeometry, centerMaterial);
    centerRing.rotation.x = -Math.PI / 2;
    scene.add(centerRing);
    accentElements.push(centerRing);

    // Mouse interaction
    const mouse = { x: 0, y: 0 };
    const targetMouse = { x: 0, y: 0 };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      targetMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    let time = 0;

    // Purposeful animation
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      time += 0.008;

      // Smooth mouse interpolation
      mouse.x += (targetMouse.x - mouse.x) * 0.03;
      mouse.y += (targetMouse.y - mouse.y) * 0.03;

      // Subtle grid animation
      gridLines.forEach((line, index) => {
        const material = line.material as THREE.LineBasicMaterial;
        const baseOpacity = material.color.getHex() === 0xff5b04 ? 0.8 : 
                           material.color.getHex() === 0x2a2a2a ? 0.3 : 0.15;
        
        // Subtle pulse
        const pulse = Math.sin(time * 2 + index * 0.1) * 0.1 + 0.9;
        material.opacity = baseOpacity * pulse;
      });

      // Animate accent elements
      accentElements.forEach((element, index) => {
        if (index < 4) { // Corner rings
          element.rotation.z = time * 0.5;
          const pulse = Math.sin(time * 1.5 + index) * 0.2 + 0.8;
          (element.material as THREE.MeshBasicMaterial).opacity = 0.6 * pulse;
        } else { // Center ring
          element.rotation.z = -time * 0.3;
          const pulse = Math.sin(time * 2) * 0.3 + 0.7;
          (element.material as THREE.MeshBasicMaterial).opacity = 0.8 * pulse;
        }
      });

      // Responsive camera movement
      camera.position.x = mouse.x * 5;
      camera.position.y = 8 + mouse.y * 3;
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
      gridLines.forEach(line => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
      
      accentElements.forEach(element => {
        element.geometry.dispose();
        (element.material as THREE.Material).dispose();
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
