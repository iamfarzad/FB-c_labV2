'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroBackground5() {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Clean data visualization scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    // Isometric-style camera for data viz
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);

    // Clean renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Data visualization elements
    const dataElements: THREE.Mesh[] = [];
    const connections: THREE.Line[] = [];

    // Create data bars (representing metrics)
    const barCount = 12;
    const radius = 8;

    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Varying heights for data representation
      const height = 1 + Math.random() * 4;

      const geometry = new THREE.BoxGeometry(0.8, height, 0.8);
      const material = new THREE.MeshBasicMaterial({
        color: height > 3 ? 0xff5b04 : height > 2 ? 0xff8f6a : 0xf5f5f5,
        transparent: true,
        opacity: 0.8
      });

      const bar = new THREE.Mesh(geometry, material);
      bar.position.set(x, height / 2, z);

      // Store data properties
      (bar as any).originalHeight = height;
      (bar as any).targetHeight = height;
      (bar as any).angle = angle;
      (bar as any).radius = radius;

      scene.add(bar);
      dataElements.push(bar);
    }

    // Create connection lines between data points
    for (let i = 0; i < barCount; i++) {
      const currentBar = dataElements[i];
      const nextBar = dataElements[(i + 1) % barCount];

      const points = [
        new THREE.Vector3(currentBar.position.x, currentBar.position.y, currentBar.position.z),
        new THREE.Vector3(nextBar.position.x, nextBar.position.y, nextBar.position.z)
      ];

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x2a2a2a,
        transparent: true,
        opacity: 0.4
      });

      const line = new THREE.Line(geometry, material);
      scene.add(line);
      connections.push(line);
    }

    // Central data hub
    const hubGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 16);
    const hubMaterial = new THREE.MeshBasicMaterial({
      color: 0xff5b04,
      transparent: true,
      opacity: 0.9
    });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    hub.position.y = 0.1;
    scene.add(hub);
    dataElements.push(hub);

    // Data flow indicators (small moving elements)
    const flowElements: THREE.Mesh[] = [];

    for (let i = 0; i < 8; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: 0xff8f6a,
        transparent: true,
        opacity: 0.7
      });

      const sphere = new THREE.Mesh(geometry, material);

      // Random starting position on circle
      const angle = Math.random() * Math.PI * 2;
      sphere.position.set(
        Math.cos(angle) * radius,
        0.5,
        Math.sin(angle) * radius
      );

      (sphere as any).angle = angle;
      (sphere as any).speed = 0.02 + Math.random() * 0.02;

      scene.add(sphere);
      flowElements.push(sphere);
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

    // Data-driven animation
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      time += 0.01;

      // Smooth mouse interpolation
      mouse.x += (targetMouse.x - mouse.x) * 0.03;
      mouse.y += (targetMouse.y - mouse.y) * 0.03;

      // Animate data bars (simulating real-time data)
      dataElements.forEach((element, index) => {
        if (index < barCount) { // Data bars
          const props = element as any;

          // Simulate data updates
          if (Math.random() < 0.01) {
            props.targetHeight = 1 + Math.random() * 4;
          }

          // Smooth height transitions
          const currentHeight = element.scale.y * props.originalHeight;
          const heightDiff = props.targetHeight - currentHeight;
          const newHeight = currentHeight + heightDiff * 0.05;

          element.scale.y = newHeight / props.originalHeight;
          element.position.y = newHeight / 2;

          // Update color based on height
          const material = element.material as THREE.MeshBasicMaterial;
          if (newHeight > 3) {
            material.color.setHex(0xff5b04);
          } else if (newHeight > 2) {
            material.color.setHex(0xff8f6a);
          } else {
            material.color.setHex(0xf5f5f5);
          }

          // Subtle pulse
          const pulse = Math.sin(time * 2 + index) * 0.1 + 0.9;
          material.opacity = 0.8 * pulse;

        } else if (index === barCount) { // Central hub
          element.rotation.y = time * 0.5;
          const pulse = Math.sin(time * 3) * 0.2 + 0.8;
          (element.material as THREE.MeshBasicMaterial).opacity = 0.9 * pulse;
        }
      });

      // Update connection lines
      connections.forEach((line, index) => {
        const currentBar = dataElements[index];
        const nextBar = dataElements[(index + 1) % barCount];

        const positions = line.geometry.attributes.position;
        positions.setXYZ(0, currentBar.position.x, currentBar.position.y, currentBar.position.z);
        positions.setXYZ(1, nextBar.position.x, nextBar.position.y, nextBar.position.z);
        positions.needsUpdate = true;

        // Animate line opacity
        const material = line.material as THREE.LineBasicMaterial;
        const pulse = Math.sin(time * 1.5 + index * 0.3) * 0.2 + 0.6;
        material.opacity = 0.4 * pulse;
      });

      // Animate flow elements
      flowElements.forEach((element) => {
        const props = element as any;
        props.angle += props.speed;

        element.position.x = Math.cos(props.angle) * radius;
        element.position.z = Math.sin(props.angle) * radius;

        // Fade in/out as they move
        const fadePhase = (props.angle % (Math.PI * 2)) / (Math.PI * 2);
        (element.material as THREE.MeshBasicMaterial).opacity = Math.sin(fadePhase * Math.PI) * 0.7;
      });

      // Responsive camera movement
      camera.position.x = 15 + mouse.x * 5;
      camera.position.y = 15 + mouse.y * 3;
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
      [...dataElements, ...flowElements].forEach(element => {
        element.geometry.dispose();
        (element.material as THREE.Material).dispose();
      });

      connections.forEach(line => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
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
