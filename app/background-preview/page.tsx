'use client';

import { useState, Suspense } from 'react';
import HeroBackground1 from '@/components/backgrounds/HeroBackground1';
import HeroBackground2 from '@/components/backgrounds/HeroBackground2';
import HeroBackground3 from '@/components/backgrounds/HeroBackground3';
import HeroBackground4 from '@/components/backgrounds/HeroBackground4';
import HeroBackground5 from '@/components/backgrounds/HeroBackground5';
import HeroBackground6 from '@/components/backgrounds/HeroBackground6';

export default function BackgroundPreview() {
  const [selectedBackground, setSelectedBackground] = useState(0);
  
  const backgrounds = [
    { id: 0, Component: HeroBackground1, name: 'Floating Particles' },
    { id: 1, Component: HeroBackground2, name: 'Wave Animation' },
    { id: 2, Component: HeroBackground3, name: 'Geometric Grid' },
    { id: 3, Component: HeroBackground4, name: 'Neural Network' },
    { id: 4, Component: HeroBackground5, name: 'Spiral Galaxy' },
    { id: 5, Component: HeroBackground6, name: 'Matrix Rain' },
  ];

  const CurrentBackground = backgrounds[selectedBackground].Component;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
        Background Components Preview
      </h1>
      
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {backgrounds.map((bg) => (
          <button
            key={bg.id}
            onClick={() => setSelectedBackground(bg.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedBackground === bg.id
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {bg.name}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 bg-gray-800 text-white">
            <h2 className="text-lg font-semibold">
              {backgrounds[selectedBackground].name}
            </h2>
            <p className="text-gray-300 text-sm">
              Interactive Three.js background component
            </p>
          </div>
          <div className="h-96 relative">
            <Suspense 
              fallback={
                <div className="h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading background...</p>
                  </div>
                </div>
              }
            >
              <CurrentBackground />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            About These Backgrounds
          </h3>
          <p className="text-gray-600 leading-relaxed">
            These are interactive Three.js background components designed for modern web applications. 
            Each background features smooth animations and responds to user interactions.
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Technical Details
          </h3>
          <ul className="text-gray-600 space-y-2">
            <li>• Built with Three.js and React</li>
            <li>• Client-side rendered components</li>
            <li>• Optimized for performance</li>
            <li>• Responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
