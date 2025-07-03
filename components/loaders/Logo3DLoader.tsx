import React from 'react';

interface Logo3DLoaderProps {
  size?: string;
}

export const Logo3DLoader: React.FC<Logo3DLoaderProps> = ({ size }) => {
  return (
    <div className={`flex items-center justify-center h-full ${size}`}>
      <div className="text-white">Loading 3D Model...</div>
    </div>
  );
};
