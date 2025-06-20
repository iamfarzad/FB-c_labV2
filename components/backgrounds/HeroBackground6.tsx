'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroBackground6() {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Clean terminal scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Orthographic camera for clean text display
    const camera = new THREE.OrthographicCamera(
      width / -50, width / 50,
      height / 50, height / -50,
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

    // Terminal text lines
    const textLines: THREE.Mesh[] = [];
    const lineCount = 20;
    const lineHeight = 1.5;

    // Create text-like rectangles
    for (let i = 0; i < lineCount; i++) {
      // Varying line lengths (simulating code)
      const lineLength = 2 + Math.random() * 8;
      const geometry = new THREE.PlaneGeometry(lineLength, 0.3);

      // Color based on line type
      let color, opacity;
      const lineType = Math.random();

      if (lineType < 0.1) {
        color = 0xff5b04; // Orange for important lines (errors/warnings)
        opacity = 0.9;
      } else if (lineType < 0.3) {
        color = 0xff8f6a; // Orange light for comments
        opacity = 0.7;
      } else {
        color = 0x00ff00; // Classic terminal green
        opacity = 0.8;
      }

      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity
      });

      const line = new THREE.Mesh(geometry, material);

      // Position lines vertically
      line.position.set(
        -5 + Math.random() * 2, // Slight horizontal offset
        (lineCount / 2 - i) * lineHeight,
        0
      );

      // Store properties
      (line as any).originalOpacity = opacity;
      (line as any).scrollSpeed = 0.02 + Math.random() * 0.03;
      (line as any).originalY = line.position.y;

      scene.add(line);
      textLines.push(line);
    }

    // Cursor/prompt indicator
    const cursorGeometry = new THREE.PlaneGeometry(0.2, 0.4);
    const cursorMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 1
    });
    const cursor = new THREE.Mesh(cursorGeometry, cursorMaterial);
    cursor.position.set(-8, -lineCount / 2 * lineHeight - 1, 0);
    scene.add(cursor);

    // Terminal border/frame
    const borderLines: THREE.Line[] = [];

    // Create simple border
    const borderPoints = [
      [new THREE.Vector3(-12, 12, 0), new THREE.Vector3(12, 12, 0)], // Top
      [new THREE.Vector3(12, 12, 0), new THREE.Vector3(12, -12, 0)], // Right
      [new THREE.Vector3(12, -12, 0), new THREE.Vector3(-12, -12, 0)], // Bottom
      [new THREE.Vector3(-12, -12, 0), new THREE.Vector3(-12, 12, 0)] // Left
    ];

    borderPoints.forEach(points => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x333333,
        transparent: true,
        opacity: 0.3
      });

      const line = new THREE.Line(geometry, material);
      scene.add(line);
      borderLines.push(line);
    });

    // Mouse interaction
    const mouse = { x: 0, y: 0 };
    const targetMouse = { x: 0, y: 0 };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      targetMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    let time = 0;

    // Terminal-like animation
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      time += 0.016;

      // Smooth mouse interpolation
      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;

      // Animate text lines (scrolling effect)
      textLines.forEach((line, index) => {
        const props = line as any;

        // Scroll up
        line.position.y += props.scrollSpeed;

        // Reset when off screen
        if (line.position.y > 15) {
          line.position.y = -15;

          // Randomize line properties
          const lineLength = 2 + Math.random() * 8;
          line.scale.x = lineLength / 10; // Adjust scale instead of geometry

          // Update color
          const lineType = Math.random();
          const material = line.material as THREE.MeshBasicMaterial;

          if (lineType < 0.1) {
            material.color.setHex(0xff5b04);
            props.originalOpacity = 0.9;
          } else if (lineType < 0.3) {
            material.color.setHex(0xff8f6a);
            props.originalOpacity = 0.7;
          } else {
            material.color.setHex(0x00ff00);
            props.originalOpacity = 0.8;
          }
        }

        // Typing effect (fade in as lines appear)
        const distanceFromBottom = line.position.y + 15;
        if (distanceFromBottom < 2) {
          const fadeIn = distanceFromBottom / 2;
          (line.material as THREE.MeshBasicMaterial).opacity = props.originalOpacity * fadeIn;
        } else {
          (line.material as THREE.MeshBasicMaterial).opacity = props.originalOpacity;
        }

        // Mouse proximity effect
        const mouseWorldY = mouse.y * (height / 50);
        const distanceToMouse = Math.abs(line.position.y - mouseWorldY);

        if (distanceToMouse < 3) {
          const influence = (3 - distanceToMouse) / 3;
          (line.material as THREE.MeshBasicMaterial).opacity = Math.min(1, props.originalOpacity + influence * 0.3);
        }
      });

      // Animate cursor (blinking)
      const blink = Math.sin(time * 4) > 0 ? 1 : 0.3;
      (cursor.material as THREE.MeshBasicMaterial).opacity = blink;

      // Subtle border pulse
      borderLines.forEach(line => {
        const pulse = Math.sin(time * 0.5) * 0.1 + 0.3;
        (line.material as THREE.LineBasicMaterial).opacity = pulse;
      });

      renderer.render(scene, camera);
    };

    // Handle resize
    const handleResize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;

      camera.left = width / -50;
      camera.right = width / 50;
      camera.top = height / 50;
      camera.bottom = height / -50;
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
      [...textLines, cursor].forEach(element => {
        element.geometry.dispose();
        (element.material as THREE.Material).dispose();
      });

      borderLines.forEach(line => {
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
        background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)'
      }}
    />
  );
}
