import Link from 'next/link';
import { Dumbbell } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050507] border-t border-card-border py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-6 w-6 text-gold" />
              <span className="text-xl font-black tracking-wider text-foreground">
                Gnaneswar<span className="text-gold font-normal">_Fit</span>
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Elite bodybuilding coaching & optimized diet plans designed to push you beyond your limits. Achieve gravity-defying transformations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gold uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About Coach</Link>
              </li>
              <li>
                <Link href="/programs" className="text-sm text-gray-400 hover:text-white transition-colors">Programs</Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing Options</Link>
              </li>
            </ul>
          </div>

          {/* Core Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gold uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/transformations" className="text-sm text-gray-400 hover:text-white transition-colors">Success Stories</Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Support & Contact</Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Client Login</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-gold uppercase tracking-wider mb-4">Get In Touch</h3>
            <p className="text-sm text-gray-400 mb-1">Email: anjaniprasad176@gmail.com</p>
            <p className="text-sm text-gray-400 mb-1">WhatsApp: +91 6309764875</p>
            <p className="text-sm text-gray-400 mb-1">Instagram: @gnaneswar_bb</p>
            <p className="text-sm text-gray-400">Location: Hyderabad, India</p>
          </div>
        </div>
        
        <div className="border-t border-card-border mt-8 pt-8 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Gnaneswar_Fit. All rights reserved. Created for Gnaneswar Kokkirala.
          </p>
        </div>
      </div>
    </footer>
  );
}
