'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { dotGridVariant } from './variants/dotGrid';
import { topographicVariant } from './variants/topographic';

const variants = {
  dotGrid: dotGridVariant,
  topographic: topographicVariant,
};

export type HeroBackgroundVariant = keyof typeof variants;

interface HeroBackgroundProps {
  variant: HeroBackgroundVariant;
  className?: string;
  theme?: 'light' | 'dark';
}

export function HeroBackground({ variant, className, theme = 'dark' }: HeroBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const clock = useRef<THREE.Clock>(new THREE.Clock());

  const selectedVariant = useMemo(() => variants[variant] || variants.dotGrid, [variant]);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Scene, Camera, Renderer setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);
    
    // Initialize variant-specific objects
    const variantObjects = selectedVariant.init(scene, theme);

    // Mouse tracking
    const mouse = new THREE.Vector2(-10, -10);
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    // Animation loop
    const animate = () => {
      const time = clock.current.getElapsedTime();
      
      if (selectedVariant.animate) {
        (selectedVariant.animate as any)(time, mouse, variantObjects, currentMount.clientWidth, currentMount.clientHeight);
      }
      
      // ... (variant-specific camera updates)
      
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current!);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selectedVariant, theme, clock]);

  return <div ref={mountRef} className={`absolute inset-0 w-full h-full -z-10 ${className}`} />;
}
