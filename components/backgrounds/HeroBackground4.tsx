'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroBackground4() {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Clean network topology scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    // Isometric camera for network diagram view
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 10, 15);
    camera.lookAt(0, 0, 0);

    // Clean renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Network nodes
    const nodes: THREE.Mesh[] = [];
    const connections: THREE.Line[] = [];

    // Create hierarchical network structure
    const layers = [
      { count: 1, y: 2, radius: 0.3, color: 0xff5b04, type: 'core' },      // Core node
      { count: 3, y: 1, radius: 0.2, color: 0xff8f6a, type: 'primary' },   // Primary nodes
      { count: 6, y: 0, radius: 0.15, color: 0xf5f5f5, type: 'secondary' }, // Secondary nodes
      { count: 8, y: -1, radius: 0.1, color: 0x2a2a2a, type: 'edge' }      // Edge nodes
    ];

    // Create nodes for each layer
    layers.forEach((layer, layerIndex) => {
      for (let i = 0; i < layer.count; i++) {
        const angle = (i / layer.count) * Math.PI * 2;
        const distance = layerIndex === 0 ? 0 : 2 + layerIndex * 1.5;
        
        const geometry = new THREE.SphereGeometry(layer.radius, 16, 16);
        const material = new THREE.MeshBasicMaterial({
          color: layer.color,
          transparent: true,
          opacity: 0.8
        });
        
        const node = new THREE.Mesh(geometry, material);
        node.position.set(
          Math.cos(angle) * distance,
          layer.y,
          Math.sin(angle) * distance
        );
        
        // Store node properties
        (node as any).layer = layerIndex;
        (node as any).nodeIndex = i;
        (node as any).nodeType = layer.type;
        (node as any).originalOpacity = 0.8;
        (node as any).originalRadius = layer.radius;
        (node as any).pulsePhase = Math.random() * Math.PI * 2;
        
        scene.add(node);
        nodes.push(node);
      }
    });

    // Create connections between layers
    layers.forEach((layer, layerIndex) => {
      if (layerIndex === 0) return; // Skip core layer
      
      const currentLayerNodes = nodes.filter(node => (node as any).layer === layerIndex);
      const previousLayerNodes = nodes.filter(node => (node as any).layer === layerIndex - 1);
      
      currentLayerNodes.forEach(currentNode => {
        previousLayerNodes.forEach(previousNode => {
          // Create connection line
          const points = [
            previousNode.position.clone(),
            currentNode.position.clone()
          ];
          
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.3
          });
          
          const line = new THREE.Line(geometry, material);
          
          // Store connection properties
          (line as any).fromNode = previousNode;
          (line as any).toNode = currentNode;
          (line as any).originalOpacity = 0.3;
          (line as any).dataFlow = Math.random();
          
          scene.add(line);
          connections.push(line);
        });
      });
    });

    // Data flow indicators (small moving particles)
    const dataPackets: THREE.Mesh[] = [];
    
    connections.forEach((connection, index) => {
      if (Math.random() < 0.3) { // Only some connections have data flow
        const geometry = new THREE.SphereGeometry(0.02, 8, 8);
        const material = new THREE.MeshBasicMaterial({
          color: 0xff5b04,
          transparent: true,
          opacity: 0.9
        });
        
        const packet = new THREE.Mesh(geometry, material);
        
        // Store packet properties
        (packet as any).connection = connection;
        (packet as any).progress = Math.random();
        (packet as any).speed = 0.01 + Math.random() * 0.02;
        
        scene.add(packet);
        dataPackets.push(packet);
      }
    });

    // Network status indicators
    const statusRings: THREE.Mesh[] = [];
    
    // Core node status ring
    const coreNode = nodes[0];
    const ringGeometry = new THREE.RingGeometry(0.4, 0.5, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xff5b04,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    
    const statusRing = new THREE.Mesh(ringGeometry, ringMaterial);
    statusRing.position.copy(coreNode.position);
    statusRing.lookAt(camera.position);
    scene.add(statusRing);
    statusRings.push(statusRing);

    // Mouse interaction
    const mouse = { x: 0, y: 0 };
    const targetMouse = { x: 0, y: 0 };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      targetMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    let time = 0;

    // Network topology animation
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      time += 0.01;

      // Smooth mouse interpolation
      mouse.x += (targetMouse.x - mouse.x) * 0.03;
      mouse.y += (targetMouse.y - mouse.y) * 0.03;

      // Animate nodes
      nodes.forEach((node, index) => {
        const props = node as any;
        
        // Pulsing based on node type
        let pulseIntensity;
        switch (props.nodeType) {
          case 'core':
            pulseIntensity = 0.3;
            break;
          case 'primary':
            pulseIntensity = 0.2;
            break;
          case 'secondary':
            pulseIntensity = 0.15;
            break;
          default:
            pulseIntensity = 0.1;
        }
        
        const pulse = Math.sin(time * 2 + props.pulsePhase) * pulseIntensity + (1 - pulseIntensity);
        (node.material as THREE.MeshBasicMaterial).opacity = props.originalOpacity * pulse;
        
        // Subtle scale animation for core node
        if (props.nodeType === 'core') {
          const scale = 1 + Math.sin(time * 1.5) * 0.1;
          node.scale.setScalar(scale);
        }
        
        // Mouse proximity effect
        const mouseWorldX = mouse.x * 10;
        const mouseWorldZ = mouse.y * 10;
        const distanceToMouse = Math.sqrt(
          Math.pow(node.position.x - mouseWorldX, 2) + 
          Math.pow(node.position.z - mouseWorldZ, 2)
        );
        
        if (distanceToMouse < 4) {
          const influence = (4 - distanceToMouse) / 4;
          (node.material as THREE.MeshBasicMaterial).opacity = Math.min(1, props.originalOpacity + influence * 0.5);
          
          if (props.nodeType !== 'core') {
            const scale = 1 + influence * 0.3;
            node.scale.setScalar(scale);
          }
        } else if (props.nodeType !== 'core') {
          node.scale.setScalar(1);
        }
      });

      // Animate connections
      connections.forEach((connection, index) => {
        const props = connection as any;
        
        // Data flow animation
        const flowPulse = Math.sin(time * 3 + index * 0.5) * 0.2 + 0.8;
        (connection.material as THREE.LineBasicMaterial).opacity = props.originalOpacity * flowPulse;
        
        // Update connection geometry if nodes moved
        const positions = connection.geometry.attributes.position;
        positions.setXYZ(0, props.fromNode.position.x, props.fromNode.position.y, props.fromNode.position.z);
        positions.setXYZ(1, props.toNode.position.x, props.toNode.position.y, props.toNode.position.z);
        positions.needsUpdate = true;
      });

      // Animate data packets
      dataPackets.forEach((packet) => {
        const props = packet as any;
        const connection = props.connection;
        const fromPos = (connection as any).fromNode.position;
        const toPos = (connection as any).toNode.position;
        
        // Move packet along connection
        props.progress += props.speed;
        
        if (props.progress >= 1) {
          props.progress = 0;
        }
        
        // Interpolate position
        packet.position.lerpVectors(fromPos, toPos, props.progress);
        
        // Fade in/out during travel
        const fadePhase = Math.sin(props.progress * Math.PI);
        (packet.material as THREE.MeshBasicMaterial).opacity = 0.9 * fadePhase;
      });

      // Animate status rings
      statusRings.forEach((ring) => {
        ring.rotation.z += 0.01;
        const pulse = Math.sin(time * 2) * 0.2 + 0.6;
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.4 * pulse;
        ring.lookAt(camera.position);
      });

      // Responsive camera movement
      camera.position.x = mouse.x * 5;
      camera.position.y = 10 + mouse.y * 3;
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
      [...nodes, ...dataPackets, ...statusRings].forEach(element => {
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
