"use client"

import dynamic from 'next/dynamic';

interface LoadingContainerProps {
  height: 'screen' | 'chat';
}

export default function LoadingContainer({ height }: LoadingContainerProps) {
  const isScreen = height === 'screen';
  const heightClass = isScreen ? 'min-h-screen' : 'min-h-[80vh]';
  const fallbackHeightClass = isScreen ? 'h-screen' : 'h-[80vh]';
  const text = isScreen ? 'Loading...' : 'Loading chat...';

  const Loader = dynamic(() => import('@/components/ui/3d-box-loader-animation'), {
    ssr: false,
    loading: () => <div className={`flex items-center justify-center ${fallbackHeightClass}`}>{text}</div>,
  });

  return (
    <div className={`flex items-center justify-center ${heightClass} bg-background`}>
      <Loader />
    </div>
  );
}
