'use client';
import dynamic from 'next/dynamic';

// Dynamically import PSWVoiceReporter with SSR disabled to prevent prerender errors
const PSWVoiceReporter = dynamic(
  () => import('./PSWVoiceReporter'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#030817] via-[#0E1535] to-[#030817]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E3A248] mb-4"></div>
          <p className="text-[#E3A248] text-lg font-medium">Loading PSW Voice Reporter...</p>
        </div>
      </div>
    )
  }
);

export default function PSWClientWrapper() {
  return <PSWVoiceReporter />;
}
