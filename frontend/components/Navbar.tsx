'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useState } from 'react';
import { Menu, X, Shield, LayoutDashboard, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="glass-panel sticky top-0 z-50 border-b border-card-border/80 shadow-2xl backdrop-blur-md bg-background/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative h-11 w-11 rounded-xl overflow-hidden border border-gold/40 shadow-[0_0_15px_rgba(229,169,60,0.3)] group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="/logo.png" 
                  alt="Gnaneswar Fit Logo" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-wider text-foreground uppercase leading-none">
                  Gnaneswar<span className="gold-gradient-text">FIT</span>
                </span>
                <span className="text-[10px] tracking-widest uppercase text-gold/80 font-bold mt-0.5">
                  Train • Eat • Improve
                </span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-7">
            <Link href="/" className="text-gray-300 hover:text-gold transition-colors font-semibold text-sm">Home</Link>
            <Link href="/about" className="text-gray-300 hover:text-gold transition-colors font-semibold text-sm">About</Link>
            <Link href="/programs" className="text-gray-300 hover:text-gold transition-colors font-semibold text-sm">Programs</Link>
            <Link href="/pricing" className="text-gray-300 hover:text-gold transition-colors font-semibold text-sm">Pricing</Link>
            <Link href="/transformations" className="text-gray-300 hover:text-gold transition-colors font-semibold text-sm">Transformations</Link>
            <Link href="/blog" className="text-gray-300 hover:text-gold transition-colors font-semibold text-sm">Blog</Link>
            <Link href="/contact" className="text-gray-300 hover:text-gold transition-colors font-semibold text-sm">Contact</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  href={user.role === 'admin' ? '/admin' : '/dashboard'} 
                  className="inline-flex items-center space-x-2 text-xs font-bold text-foreground px-4 py-2 rounded-full border border-gold/40 hover:border-gold hover:text-gold bg-gold/5 transition-all duration-300 shadow-[0_0_10px_rgba(229,169,60,0.15)]"
                >
                  {user.role === 'admin' ? (
                    <>
                      <Shield className="h-3.5 w-3.5 text-gold" />
                      <span>Admin Portal</span>
                    </>
                  ) : (
                    <>
                      <LayoutDashboard className="h-3.5 w-3.5 text-gold" />
                      <span>My Dashboard</span>
                    </>
                  )}
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-black gold-gradient-bg px-4 py-2 rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(229,169,60,0.3)]"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-xs font-bold text-black gold-gradient-bg px-6 py-2.5 rounded-full hover:shadow-[0_0_20px_var(--gold-glow)] hover:scale-105 transition-all duration-300 tracking-wide uppercase"
              >
                Admin Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2.5 rounded-xl text-gray-300 hover:text-gold hover:bg-card-bg focus:outline-none border border-card-border"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-card-border bg-[#090a0f]/95 backdrop-blur-xl">
          <div className="px-4 pt-3 pb-6 space-y-2 text-center">
            <Link 
              href="/" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-gray-300 hover:text-gold hover:bg-card-bg"
            >
              Home
            </Link>
            <Link 
              href="/about" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-gray-300 hover:text-gold hover:bg-card-bg"
            >
              About
            </Link>
            <Link 
              href="/programs" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-gray-300 hover:text-gold hover:bg-card-bg"
            >
              Programs
            </Link>
            <Link 
              href="/pricing" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-gray-300 hover:text-gold hover:bg-card-bg"
            >
              Pricing
            </Link>
            <Link 
              href="/transformations" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-gray-300 hover:text-gold hover:bg-card-bg"
            >
              Transformations
            </Link>
            <Link 
              href="/blog" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-gray-300 hover:text-gold hover:bg-card-bg"
            >
              Blog
            </Link>
            <Link 
              href="/contact" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-gray-300 hover:text-gold hover:bg-card-bg"
            >
              Contact
            </Link>
            
            <div className="pt-4 border-t border-card-border/80 flex flex-col items-center space-y-3">
              {user ? (
                <>
                  <Link 
                    href={user.role === 'admin' ? '/admin' : '/dashboard'} 
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center text-sm font-bold text-foreground py-3 rounded-full border border-gold/40 bg-gold/10 hover:border-gold hover:text-gold"
                  >
                    {user.role === 'admin' ? 'Admin Portal' : 'My Dashboard'}
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="w-full text-center text-sm font-bold text-black gold-gradient-bg py-3 rounded-full"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-sm font-bold text-black gold-gradient-bg py-3 rounded-full shadow-[0_0_15px_rgba(229,169,60,0.3)]"
                >
                  Admin Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
