'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TailoredCareLogo = () => (
    <svg width="40" height="28" viewBox="0 0 60 40" className="inline-block">
      <defs>
        <linearGradient id="navBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#1B365D', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#0F1E3A', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="navGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#D4A574', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#C39760', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Blue wing/leaf (left) */}
      <path
        d="M15,20 Q10,10 20,8 Q28,7 30,15 Q31,20 25,22 Q18,24 15,20 Z"
        fill="url(#navBlueGradient)"
      />

      {/* Gold wing/leaf (right) */}
      <path
        d="M45,20 Q50,10 40,8 Q32,7 30,15 Q29,20 35,22 Q42,24 45,20 Z"
        fill="url(#navGoldGradient)"
      />

      {/* Central heart */}
      <path
        d="M30,16 Q27,12 24,14 Q22,16 24,19 L30,25 L36,19 Q38,16 36,14 Q33,12 30,16 Z"
        fill="url(#navGoldGradient)"
      />
    </svg>
  );

interface NavigationProps {
  user?: {
    name: string;
    role: string;
    email: string;
  };
}

export default function Navigation({ user }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Admin', href: '/admin', icon: '⚙️', adminOnly: true },
    { name: 'Reports', href: '/reports', icon: '📋' },
    { name: 'Search', href: '/search', icon: '🔍' },
    { name: 'Monitoring', href: '/admin/monitoring', icon: '📊', adminOnly: true },
    { name: 'Analytics', href: '/analytics', icon: '📈', adminOnly: true },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-[rgba(3,8,23,0.9)] backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(2,5,12,0.6)] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
              <TailoredCareLogo />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white">Tailored Care Solutions</span>
                <span className="text-xs text-white/60">PSW Documentation</span>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navigation
              .filter(item => !item.adminOnly || user?.role === 'admin')
              .map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    isActive(item.href)
                      ? 'bg-white text-[#2C1301] shadow-[0_12px_25px_rgba(255,255,255,0.25)]'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
          </div>

          {/* User menu (desktop) */}
          <div className="hidden md:flex md:items-center">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--tcs-light-gold)] to-[var(--tcs-gold)] flex items-center justify-center text-[#2C1301] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name}</span>
                  <svg className={`w-4 h-4 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-[#F1E0CC] py-1 z-50">
                    <div className="px-4 py-3 border-b border-[#F1E0CC]">
                      <p className="text-sm font-medium text-[#1F1B16]">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-[#C9822D] font-semibold mt-1">{user.role.toUpperCase()}</p>
                    </div>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#FFF5E6]">
                      👤 Profile
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#FFF5E6]">
                      ⚙️ Settings
                    </Link>
                    <Link href="/settings/mfa" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#FFF5E6]">
                      🔒 Security (MFA)
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => {/* Handle logout */}}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-2xl"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-6 py-2 rounded-full font-semibold text-[#2C1301] bg-gradient-to-r from-[var(--tcs-light-gold)] to-[var(--tcs-gold)] shadow-[0_12px_30px_rgba(227,162,72,0.35)]"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-white hover:bg-white/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[rgba(3,8,23,0.95)] backdrop-blur-xl">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation
              .filter(item => !item.adminOnly || user?.role === 'admin')
              .map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-medium ${
                    isActive(item.href)
                      ? 'bg-white text-[#2C1301]'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}

            {user ? (
              <>
                <hr className="my-2" />
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-white/60">{user.email}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base text-white/70 hover:bg-white/10 rounded-xl"
                >
                  👤 Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base text-white/70 hover:bg-white/10 rounded-xl"
                >
                  ⚙️ Settings
                </Link>
                <button
                  onClick={() => {/* Handle logout */}}
                  className="block w-full text-left px-4 py-3 text-base text-red-400 hover:bg-red-500/10 rounded-xl"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 bg-gradient-to-r from-[var(--tcs-light-gold)] to-[var(--tcs-gold)] text-[#2C1301] text-center rounded-full font-semibold"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
