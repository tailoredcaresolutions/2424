'use client';
import dynamic from 'next/dynamic';

const SimplePSWChat = dynamic(
  () => import('./SimplePSWChat'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mb-4"></div>
          <p className="text-gray-600 text-sm">Loading chat...</p>
        </div>
      </div>
    )
  }
);

export default function SimpleChatWrapper() {
  return <SimplePSWChat />;
}
