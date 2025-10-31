'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Settings, 
  FileText, 
  Search, 
  BarChart3, 
  Activity,
  User,
  Shield,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const TailoredCareLogo = () => (
    <svg width="42" height="30" viewBox="0 0 60 40" className="inline-block drop-shadow-[0_2px_8px_rgba(201,160,99,0.3)]">
      <defs>
        <linearGradient id="navBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#1B365D', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#122853', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#0F1E3A', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="navGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#d4b078', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#c9a063', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#b89452', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Blue wing/leaf (left) with enhanced depth */}
      <path
        d="M15,20 Q10,10 20,8 Q28,7 30,15 Q31,20 25,22 Q18,24 15,20 Z"
        fill="url(#navBlueGradient)"
        filter="url(#glow)"
      />

      {/* Gold wing/leaf (right) with enhanced depth */}
      <path
        d="M45,20 Q50,10 40,8 Q32,7 30,15 Q29,20 35,22 Q42,24 45,20 Z"
        fill="url(#navGoldGradient)"
        filter="url(#glow)"
      />

      {/* Central heart with enhanced gradient */}
      <path
        d="M30,16 Q27,12 24,14 Q22,16 24,19 L30,25 L36,19 Q38,16 36,14 Q33,12 30,16 Z"
        fill="url(#navGoldGradient)"
        filter="url(#glow)"
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
    { name: 'Home', href: '/', icon: Home, adminOnly: false },
    { name: 'Admin', href: '/admin', icon: Settings, adminOnly: true },
    { name: 'Reports', href: '/reports', icon: FileText, adminOnly: false },
    { name: 'Search', href: '/search', icon: Search, adminOnly: false },
    { name: 'Monitoring', href: '/admin/monitoring', icon: Activity, adminOnly: true },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, adminOnly: true },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="liquid-glass sticky top-0 z-40 border-b border-tcs-blue-light/30 shadow-[0_8px_32px_rgba(0,0,0,0.4)] safe-area-top">
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
              .map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`touch-target px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 button-press flex items-center gap-2 ${
                      isActive(item.href)
                        ? 'liquid-glass-light text-tcs-blue-dark shadow-[0_12px_25px_rgba(255,255,255,0.25)] font-bold'
                        : 'text-white/80 hover:text-white hover:bg-white/10 hover:liquid-glass-vibrant'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" strokeWidth={2.5} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
          </div>

          {/* User menu (desktop) */}
          <div className="hidden md:flex md:items-center">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="touch-target flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:bg-white/10 hover:liquid-glass-vibrant transition-all button-press"
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
                  <div className="liquid-glass-card absolute right-0 mt-2 w-56 rounded-glass shadow-2xl py-1 z-50 animate-scale-in">
                    <div className="px-4 py-3 border-b border-[#F1E0CC]">
                      <p className="text-sm font-medium text-[#1F1B16]">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-[#C9822D] font-semibold mt-1">{user.role.toUpperCase()}</p>
                    </div>
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[#FFF5E6] transition-colors">
                      <User className="w-4 h-4" strokeWidth={2} />
                      Profile
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[#FFF5E6] transition-colors">
                      <Settings className="w-4 h-4" strokeWidth={2} />
                      Settings
                    </Link>
                    <Link href="/settings/mfa" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[#FFF5E6] transition-colors">
                      <Shield className="w-4 h-4" strokeWidth={2} />
                      Security (MFA)
                    </Link>
                    <hr className="my-1 border-[#F1E0CC]" />
                    <button
                      onClick={() => {/* Handle logout */}}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-2xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={2} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="touch-target px-6 py-2 rounded-full font-semibold text-[#2C1301] liquid-glass-gold shadow-[0_12px_30px_rgba(201,160,99,0.4)] button-press"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="touch-target p-2 rounded-full text-white hover:bg-white/10 transition-all button-press"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" strokeWidth={2.5} />
              ) : (
                <Menu className="w-6 h-6" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-tcs-blue-light/20 liquid-glass-dark">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation
              .filter(item => !item.adminOnly || user?.role === 'admin')
              .map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`touch-target flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium button-press transition-all ${
                      isActive(item.href)
                        ? 'liquid-glass-light text-tcs-blue-dark font-bold'
                        : 'text-white/75 hover:text-white hover:bg-white/10 hover:liquid-glass-vibrant'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" strokeWidth={2.5} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

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
                  className="flex items-center gap-3 px-4 py-3 text-base text-white/70 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <User className="w-5 h-5" strokeWidth={2} />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-base text-white/70 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <Settings className="w-5 h-5" strokeWidth={2} />
                  Settings
                </Link>
                <button
                  onClick={() => {/* Handle logout */}}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-base text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5" strokeWidth={2} />
                  Logout
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
