'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/auth')
    }, 2500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <main className="min-h-screen bg-[#1B365D] flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="text-center space-y-8 animate-fadeIn">
        <div className="relative">
          <div 
            className="w-24 h-24 bg-[#D4A574] rounded-full mx-auto animate-pulse-glow motion-reduce:animate-none shadow-lg shadow-[#D4A574]/30"
            aria-label="Tailored Care Solutions loading indicator"
            role="img"
          />
          <div className="absolute inset-0 w-24 h-24 bg-[#D4A574] rounded-full mx-auto animate-ripple motion-reduce:animate-none opacity-30" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Tailored Care Solutions
          </h1>
          <h2 className="text-xl md:text-2xl text-[#D4A574] font-medium">
            PSW Voice Documentation
          </h2>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(212, 165, 116, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(212, 165, 116, 0.5);
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }

        .animate-pulse-glow {
          animation: pulseGlow 2s ease-in-out infinite;
        }

        .animate-ripple {
          animation: ripple 2s ease-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .motion-reduce\\:animate-none {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  )
}
