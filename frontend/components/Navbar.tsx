'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useState } from 'react';
import { Menu, X, Shield, LayoutDashboard, LogOut, Dumbbell, Zap } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Transformations', href: '/transformations' },
    { name: 'Workouts', href: '/#workouts' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-[#00BFFF]/25 shadow-2xl backdrop-blur-xl bg-[#050505]/90 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group logo-shine">
              <div className="relative h-11 w-11 rounded-xl overflow-hidden border border-[#00BFFF]/40 shadow-[0_0_15px_rgba(0,191,255,0.25)] group-hover:scale-105 group-hover:border-[#00BFFF] transition-all duration-300 bg-[#0B0F12]">
                <img 
                  src="/logo.png?v=2" 
                  alt="Gnaneswar Fit Logo" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black font-display tracking-wider text-white uppercase leading-none">
                  Gnaneswar<span className="cyan-gradient-text">FIT</span>
                </span>
                <span className="text-[10px] tracking-widest uppercase text-[#00BFFF] font-extrabold mt-0.5">
                  Train • Eat • Improve
                </span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-bold uppercase tracking-wider transition-all duration-200 relative py-1 ${
                    isActive
                      ? 'text-[#00BFFF] font-extrabold'
                      : 'text-gray-300 hover:text-[#00BFFF]'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00BFFF] rounded-full shadow-[0_0_8px_#00BFFF]" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  href={user.role === 'admin' ? '/admin' : '/dashboard'} 
                  className="inline-flex items-center space-x-2 text-xs font-bold text-white px-4 py-2 rounded-full border border-[#00BFFF]/40 hover:border-[#00BFFF] hover:text-[#00BFFF] bg-[#00BFFF]/10 transition-all duration-300 shadow-[0_0_12px_rgba(0,191,255,0.2)]"
                >
                  {user.role === 'admin' ? (
                    <>
                      <Shield className="h-3.5 w-3.5 text-[#00BFFF]" />
                      <span>Admin Portal</span>
                    </>
                  ) : (
                    <>
                      <LayoutDashboard className="h-3.5 w-3.5 text-[#00BFFF]" />
                      <span>My Dashboard</span>
                    </>
                  )}
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-[#050505] cyan-gradient-bg px-4 py-2 rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(0,191,255,0.4)] uppercase"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/contact"
                  className="text-xs font-extrabold text-[#050505] cyan-gradient-bg px-5 py-2.5 rounded-full hover:shadow-[0_0_20px_rgba(0,191,255,0.6)] hover:scale-105 transition-all duration-300 tracking-wide uppercase flex items-center space-x-1.5"
                >
                  <Zap className="h-3.5 w-3.5 fill-black" />
                  <span>Start Training</span>
                </Link>
                <Link
                  href="/login"
                  className="text-xs font-bold text-gray-300 hover:text-white px-3 py-2 border border-[#1C2329] hover:border-[#00BFFF] rounded-full transition-colors"
                >
                  Admin
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2.5 rounded-xl text-gray-300 hover:text-[#00BFFF] hover:bg-[#111820] focus:outline-none border border-[#1C2329]"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-[#1C2329] bg-[#050505]/95 backdrop-blur-xl">
          <div className="px-4 pt-3 pb-6 space-y-2 text-center">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider text-gray-300 hover:text-[#00BFFF] hover:bg-[#111820]"
              >
                {link.name}
              </Link>
            ))}
            
            <div className="pt-4 border-t border-[#1C2329] flex flex-col items-center space-y-3">
              {user ? (
                <>
                  <Link 
                    href={user.role === 'admin' ? '/admin' : '/dashboard'} 
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center text-xs font-extrabold text-white py-3 rounded-full border border-[#00BFFF]/40 bg-[#00BFFF]/10 hover:border-[#00BFFF]"
                  >
                    {user.role === 'admin' ? 'Admin Portal' : 'My Dashboard'}
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="w-full text-center text-xs font-extrabold text-[#050505] cyan-gradient-bg py-3 rounded-full uppercase"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-xs font-extrabold text-[#050505] cyan-gradient-bg py-3.5 rounded-full shadow-[0_0_20px_rgba(0,191,255,0.4)] uppercase"
                >
                  Start Training
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
