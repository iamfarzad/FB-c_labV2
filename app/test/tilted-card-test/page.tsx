'use client';

import { TiltedCard } from '@/components/ui/tilted-card';

export default function TiltedCardTest() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-8 text-center">Tilted Card Test</h1>

        <TiltedCard
          imageSrc="/farzad-bayat_profile_2AI.JPG"
          altText="Test Tilted Card"
          containerHeight="400px"
          imageHeight="100%"
          imageWidth="100%"
          scaleOnHover={1.05}
          rotateAmplitude={10}
          showMobileWarning={true}
          showTooltip={true}
          captionText="This is a test caption"
          className="w-full h-[400px] rounded-2xl overflow-hidden shadow-xl"
        />

        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">TiltedCard Test</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Hover over the image above to see the tilt effect. On mobile devices, you'll see a message
            indicating that the effect works best on desktop.
          </p>
        </div>
      </div>
    </div>
  );
}
