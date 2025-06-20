"use client"

import React, { useEffect, useRef } from 'react';

interface TechCircuitAnimationProps {
  className?: string;
  theme?: 'light' | 'dark';
}

export const TechCircuitAnimation: React.FC<TechCircuitAnimationProps> = ({
  className = '',
  theme = 'dark',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodes = useRef<Array<{x: number, y: number, vx: number, vy: number}>>([]);
  const connections = useRef<Array<[number, number]>>([]);
  const lastTime = useRef(0);
  const frameCount = useRef(0);

  // Initialize nodes and connections
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.scale(dpr, dpr);

      // Adjust canvas CSS size
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      initNodes();
    };

    const initNodes = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // Clear existing nodes and connections
      nodes.current = [];
      connections.current = [];

      // Create nodes in a grid-like pattern
      const cols = 8;
      const rows = 8;
      const padding = 40;
      const cellWidth = (width - padding * 2) / (cols - 1);
      const cellHeight = (height - padding * 2) / (rows - 1);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Add some randomness to the grid
          const offsetX = (Math.random() - 0.5) * 20;
          const offsetY = (Math.random() - 0.5) * 20;

          nodes.current.push({
            x: padding + x * cellWidth + offsetX,
            y: padding + y * cellHeight + offsetY,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
          });
        }
      }

      // Create connections between nearby nodes
      for (let i = 0; i < nodes.current.length; i++) {
        for (let j = i + 1; j < nodes.current.length; j++) {
          const dx = nodes.current[i].x - nodes.current[j].x;
          const dy = nodes.current[i].y - nodes.current[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Connect nodes that are close to each other
          if (dist < 120) {
            connections.current.push([i, j]);
          }
        }
      }
    };

    const animate = (time: number) => {
      if (!lastTime.current) lastTime.current = time;
      const deltaTime = time - lastTime.current;
      lastTime.current = time;
      frameCount.current++;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update nodes
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      nodes.current.forEach(node => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Add some random movement
        if (Math.random() > 0.98) {
          node.vx += (Math.random() - 0.5) * 0.5;
          node.vy += (Math.random() - 0.5) * 0.5;
        }

        // Limit speed
        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        const maxSpeed = 1.5;
        if (speed > maxSpeed) {
          node.vx = (node.vx / speed) * maxSpeed;
          node.vy = (node.vy / speed) * maxSpeed;
        }
      });

      // Draw connections
      const lineColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
      const activeLineColor = theme === 'dark' ? 'rgba(247, 144, 9, 0.8)' : 'rgba(247, 144, 9, 0.8)';

      connections.current.forEach(([i, j]) => {
        const nodeA = nodes.current[i];
        const nodeB = nodes.current[j];

        if (!nodeA || !nodeB) return;

        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Only draw if nodes are close enough
        if (dist < 120) {
          // Make lines pulse with frame count
          const alpha = 0.1 + 0.1 * Math.sin(frameCount.current * 0.02);

          // Draw line
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);

          // Make some lines more prominent
          const isActiveLine = Math.random() > 0.7;
          if (isActiveLine) {
            ctx.strokeStyle = activeLineColor;
            ctx.lineWidth = 1.5;

            // Add glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(247, 144, 9, 0.5)';
          } else {
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 0.8;
            ctx.shadowBlur = 0;
          }

          ctx.stroke();
          ctx.shadowBlur = 0; // Reset shadow
        }
      });

      // Draw nodes
      nodes.current.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
        ctx.fill();

        // Add glow to some nodes
        if (Math.random() > 0.95) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(247, 144, 9, 0.8)';
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(247, 144, 9, 0.8)';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Schedule next frame
      animationRef.current = requestAnimationFrame(animate);
    };

    // Set up event listeners
    window.addEventListener('resize', resizeCanvas);

    // Initialize and start animation
    resizeCanvas();
    animationRef.current = requestAnimationFrame(animate);

    // Clean up
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [theme]);

  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
};
