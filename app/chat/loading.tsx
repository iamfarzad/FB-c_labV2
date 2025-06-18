import dynamic from 'next/dynamic';

const Loader = dynamic(() => import('@/components/ui/3d-box-loader-animation'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-[80vh]">Loading chat...</div>,
});

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-background">
      <Loader />
    </div>
  );
}
