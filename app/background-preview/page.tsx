'use client';

import { HeroBackground1, HeroBackground2, HeroBackground3, HeroBackground4, HeroBackground5, HeroBackground6 } from '@/components/backgrounds';

const BackgroundPreview = () => {
  const backgrounds = [
    { id: 1, Component: HeroBackground1, name: 'Hero Background 1' },
    { id: 2, Component: HeroBackground2, name: 'Hero Background 2' },
    { id: 3, Component: HeroBackground3, name: 'Hero Background 3' },
    { id: 4, Component: HeroBackground4, name: 'Hero Background 4' },
    { id: 5, Component: HeroBackground5, name: 'Hero Background 5' },
    { id: 6, Component: HeroBackground6, name: 'Hero Background 6' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Background Components Preview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {backgrounds.map(({ id, Component, name }) => (
          <div key={id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-800 text-white">
              <h2 className="text-lg font-semibold">{name}</h2>
            </div>
            <div className="h-64 relative">
              <Component className="w-full h-full" />
            </div>
            <div className="p-4">
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    // Toggle theme
                    const element = document.documentElement;
                    element.classList.toggle('dark');
                  }}
                  className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                >
                  Toggle Theme
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackgroundPreview;
