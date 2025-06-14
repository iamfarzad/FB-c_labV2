import dynamic from 'next/dynamic';

const Loader = dynamic(() => import('@/components/ui/3d-box-loader-animation'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">Loading...</div>,
});

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader />
    </div>
  );
}
