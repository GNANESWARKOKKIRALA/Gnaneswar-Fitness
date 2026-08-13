'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useState, useEffect } from 'react';
import { Menu, X, Shield, LayoutDashboard, LogOut, Dumbbell, Zap, CreditCard, Flame } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll for navbar transformation
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/', icon: null },
    { name: 'About', href: '/about', icon: null },
    { name: 'Transformations', href: '/transformations', icon: null },
    { name: 'Workouts', href: '/#workouts', icon: null },
    { name: 'Pricing', href: '/pricing', icon: CreditCard },
    { name: 'Blog', href: '/blog', icon: null },
    { name: 'Contact', href: '/contact', icon: null },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-[#050505]/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.8)]' 
        : 'bg-[#050505]/70 backdrop-blur-md'
    }`}>
      {/* Top accent bar — thin cyan-to-transparent gradient */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#00BFFF]/80 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          
          {/* Logo — Gym Badge Style */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                {/* Outer ring */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#00BFFF]/40 to-[#008CFF]/20 blur-sm group-hover:from-[#00BFFF]/60 group-hover:to-[#008CFF]/40 transition-all duration-500" />
                <div className="relative h-11 w-11 rounded-xl overflow-hidden border-2 border-[#00BFFF]/50 group-hover:border-[#00BFFF] transition-all duration-300 bg-[#0B0F12]">
                  <img 
                    src="/logo.png?v=2" 
                    alt="Gnaneswar Fit Logo" 
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black font-display tracking-wider text-white uppercase leading-none">
                  Gnaneswar<span className="cyan-gradient-text">FIT</span>
                </span>
                <span className="text-[9px] tracking-[0.25em] uppercase text-[#00BFFF]/70 font-bold mt-0.5">
                  Train • Eat • Improve
                </span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Nav — Gym Style with slash separators */}
          <div className="hidden lg:flex items-center">
            <div className="flex items-center bg-[#0B0F12]/60 border border-[#1C2329]/80 rounded-full px-2 py-1.5">
              {navLinks.map((link, idx) => {
                const isActive = pathname === link.href;
                const IconComp = link.icon;
                return (
                  <div key={link.name} className="flex items-center">
                    <Link
                      href={link.href}
                      className={`relative text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-all duration-300 flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#00BFFF] text-[#050505] font-extrabold shadow-[0_0_18px_rgba(0,191,255,0.5)]'
                          : 'text-[#8B949E] hover:text-white hover:bg-[#111820]'
                      }`}
                    >
                      {IconComp && <IconComp className={`h-3 w-3 ${isActive ? 'text-[#050505]' : 'text-[#00BFFF]'}`} />}
                      {link.name}
                    </Link>
                    {idx < navLinks.length - 1 && (
                      <span className="text-[#1C2329] mx-0.5 text-[10px] select-none">/</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right CTA */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                <Link 
                  href={user.role === 'admin' ? '/admin' : '/dashboard'} 
                  className="inline-flex items-center space-x-2 text-[11px] font-bold text-white px-4 py-2 rounded-full border border-[#1C2329] hover:border-[#00BFFF] bg-[#111820] hover:bg-[#00BFFF]/10 transition-all duration-300"
                >
                  {user.role === 'admin' ? (
                    <>
                      <Shield className="h-3.5 w-3.5 text-[#00BFFF]" />
                      <span>Admin Portal</span>
                    </>
                  ) : (
                    <>
                      <LayoutDashboard className="h-3.5 w-3.5 text-[#00BFFF]" />
                      <span>Dashboard</span>
                    </>
                  )}
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center space-x-1.5 text-[11px] font-extrabold text-[#050505] bg-[#00BFFF] px-4 py-2 rounded-full hover:bg-[#33CCFF] hover:shadow-[0_0_20px_rgba(0,191,255,0.5)] transition-all duration-300 uppercase"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/contact"
                  className="group inline-flex items-center space-x-2 text-[11px] font-black text-[#050505] bg-[#00BFFF] px-5 py-2.5 rounded-full hover:bg-[#33CCFF] hover:shadow-[0_0_25px_rgba(0,191,255,0.6)] transition-all duration-300 uppercase"
                >
                  <Flame className="h-3.5 w-3.5 group-hover:animate-bounce" />
                  <span>Join Now</span>
                </Link>
                <Link
                  href="/login"
                  className="text-[11px] font-bold text-[#8B949E] hover:text-white px-3 py-2 border border-[#1C2329] hover:border-[#00BFFF]/50 rounded-full transition-all duration-300"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button — Gym style hamburger */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`relative p-2.5 rounded-xl transition-all duration-300 border ${
                isOpen 
                  ? 'bg-[#00BFFF]/10 border-[#00BFFF]/50 text-[#00BFFF]' 
                  : 'bg-[#111820] border-[#1C2329] text-gray-300 hover:text-[#00BFFF]'
              }`}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#1C2329] to-transparent" />

      {/* Mobile Menu — Full screen overlay style */}
      {isOpen && (
        <div className="lg:hidden bg-[#050505]/98 backdrop-blur-2xl border-t border-[#1C2329] animate-slide-up">
          <div className="px-5 pt-4 pb-6 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const IconComp = link.icon;
              return (
                <Link 
                  key={link.name}
                  href={link.href} 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'text-[#050505] bg-[#00BFFF] shadow-[0_0_15px_rgba(0,191,255,0.4)]'
                      : 'text-gray-300 hover:text-white hover:bg-[#111820]'
                  }`}
                >
                  {IconComp && <IconComp className={`h-4 w-4 ${isActive ? 'text-[#050505]' : 'text-[#00BFFF]'}`} />}
                  {!IconComp && <Dumbbell className={`h-4 w-4 ${isActive ? 'text-[#050505]' : 'text-[#1C2329]'}`} />}
                  <span>{link.name}</span>
                </Link>
              );
            })}
            
            <div className="pt-4 mt-2 border-t border-[#1C2329] flex flex-col space-y-2">
              {user ? (
                <>
                  <Link 
                    href={user.role === 'admin' ? '/admin' : '/dashboard'} 
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center text-xs font-extrabold text-white py-3 rounded-xl border border-[#1C2329] bg-[#111820] hover:border-[#00BFFF] transition-all"
                  >
                    {user.role === 'admin' ? 'Admin Portal' : 'My Dashboard'}
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="w-full text-center text-xs font-extrabold text-[#050505] bg-[#00BFFF] py-3 rounded-xl uppercase hover:bg-[#33CCFF] transition-all"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-xs font-extrabold text-[#050505] bg-[#00BFFF] py-3.5 rounded-xl shadow-[0_0_20px_rgba(0,191,255,0.4)] uppercase flex items-center justify-center space-x-2"
                >
                  <Flame className="h-4 w-4" />
                  <span>Join Now</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
