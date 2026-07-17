'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useState } from 'react';
import { Dumbbell, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="glass-panel sticky top-0 z-50 border-b border-card-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Dumbbell className="h-8 w-8 text-gold animate-pulse" />
              <span className="text-2xl font-extrabold tracking-wider text-foreground">
                Gnaneswar<span className="text-gold font-normal">_Fit</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-gold transition-colors font-medium">Home</Link>
            <Link href="/about" className="text-gray-300 hover:text-gold transition-colors font-medium">About</Link>
            <Link href="/programs" className="text-gray-300 hover:text-gold transition-colors font-medium">Programs</Link>
            <Link href="/pricing" className="text-gray-300 hover:text-gold transition-colors font-medium">Pricing</Link>
            <Link href="/transformations" className="text-gray-300 hover:text-gold transition-colors font-medium">Transformations</Link>
            <Link href="/contact" className="text-gray-300 hover:text-gold transition-colors font-medium">Contact</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  href={user.role === 'admin' ? '/admin' : '/dashboard'} 
                  className="text-sm font-semibold text-foreground px-4 py-2 rounded-full border border-card-border hover:border-gold hover:text-gold transition-all duration-300"
                >
                  {user.role === 'admin' ? 'Admin Portal' : 'My Dashboard'}
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-semibold text-background gold-gradient-bg px-5 py-2 rounded-full hover:scale-105 transition-all duration-300"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm font-semibold text-background gold-gradient-bg px-6 py-2.5 rounded-full hover:shadow-[0_0_15px_var(--gold-glow)] hover:scale-105 transition-all duration-300"
              >
                Join Now
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gold focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-card-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-center">
            <Link 
              href="/" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-gold hover:bg-card-bg"
            >
              Home
            </Link>
            <Link 
              href="/about" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-gold hover:bg-card-bg"
            >
              About
            </Link>
            <Link 
              href="/programs" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-gold hover:bg-card-bg"
            >
              Programs
            </Link>
            <Link 
              href="/pricing" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-gold hover:bg-card-bg"
            >
              Pricing
            </Link>
            <Link 
              href="/transformations" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-gold hover:bg-card-bg"
            >
              Transformations
            </Link>
            <Link 
              href="/contact" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-gold hover:bg-card-bg"
            >
              Contact
            </Link>
            
            <div className="pt-4 pb-2 border-t border-card-border flex flex-col items-center space-y-3">
              {user ? (
                <>
                  <Link 
                    href={user.role === 'admin' ? '/admin' : '/dashboard'} 
                    onClick={() => setIsOpen(false)}
                    className="w-4/5 text-center text-sm font-semibold text-foreground px-4 py-2.5 rounded-full border border-card-border hover:border-gold hover:text-gold"
                  >
                    {user.role === 'admin' ? 'Admin Portal' : 'My Dashboard'}
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="w-4/5 text-center text-sm font-semibold text-background gold-gradient-bg px-5 py-2.5 rounded-full"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-4/5 text-center text-sm font-semibold text-background gold-gradient-bg px-6 py-2.5 rounded-full"
                >
                  Join Now
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
