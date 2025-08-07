"use client";

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PermissionStatus {
  microphone: PermissionState | 'unknown';
  camera: PermissionState | 'unknown';
}

export function PermissionManager() {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<PermissionStatus>({
    microphone: 'unknown',
    camera: 'unknown'
  });

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Check current permission status
        if ('permissions' in navigator) {
          const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          
          setPermissions({
            microphone: micPermission.state,
            camera: cameraPermission.state
          });

          // Listen for permission changes
          micPermission.onchange = () => {
            setPermissions(prev => ({ ...prev, microphone: micPermission.state }));
          };
          
          cameraPermission.onchange = () => {
            setPermissions(prev => ({ ...prev, camera: cameraPermission.state }));
          };
        }
      } catch (error) {
        console.warn('Permission API not available:', error);
      }
    };

    checkPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      // Request microphone access
      if (permissions.microphone !== 'granted') {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStream.getTracks().forEach(track => track.stop());
          console.log('Microphone permission granted');
        } catch (error) {
          console.warn('Microphone permission denied:', error);
        }
      }

      // Request camera access
      if (permissions.camera !== 'granted') {
        try {
          const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
          camStream.getTracks().forEach(track => track.stop());
          console.log('Camera permission granted');
        } catch (error) {
          console.warn('Camera permission denied:', error);
        }
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  // Show permission prompt if needed
  useEffect(() => {
    const hasPromptedBefore = localStorage.getItem('permissions-prompted');
    
    if (!hasPromptedBefore && 
        (permissions.microphone === 'prompt' || permissions.camera === 'prompt')) {
      
      const timer = setTimeout(() => {
        toast({
          title: "Enable Voice & Video Features",
          description: "Allow microphone and camera access to use voice chat, webcam capture, and screen sharing features.",
          action: (
            <button
              onClick={() => {
                requestPermissions();
                localStorage.setItem('permissions-prompted', 'true');
              }}
              className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90"
            >
              Enable
            </button>
          ),
          duration: 10000,
        });
      }, 2000); // Show after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [permissions, toast]);

  // This component doesn't render anything visible
  return null;
}