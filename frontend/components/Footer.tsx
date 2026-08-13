import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#050507] border-t border-card-border py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl overflow-hidden border border-gold/40 shadow-[0_0_15px_rgba(229,169,60,0.2)]">
                <img src="/logo.png?v=2" alt="Gnaneswar Fit Logo" className="h-full w-full object-cover" />
              </div>
              <span className="text-xl font-black tracking-wider text-foreground uppercase">
                Gnaneswar<span className="gold-gradient-text">FIT</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Elite bodybuilding coaching, customized progressive overload routines, and science-backed diet plans designed for maximum results by Coach Gnaneswar Kokkirala.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-4">Navigation</h3>
            <ul className="space-y-2.5">
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
              <li>
                <Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">Fitness Blog</Link>
              </li>
            </ul>
          </div>

          {/* Core Resources */}
          <div>
            <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/transformations" className="text-sm text-gray-400 hover:text-white transition-colors">Client & Self Proof</Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Support & Contact</Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Admin Login</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-4">Get In Touch</h3>
            <p className="text-sm text-gray-400 mb-1.5">Email: coach@gnaneswarfit.com</p>
            <p className="text-sm text-gray-400 mb-1.5">WhatsApp: +91 98765 43210</p>
            <p className="text-sm text-gray-400 mb-1.5">Instagram: @gnaneswar_fit</p>
            <p className="text-sm text-gray-400">Location: Hyderabad, India</p>
          </div>
        </div>
        
        <div className="border-t border-card-border mt-10 pt-8 text-center flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Gnaneswar Fit. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Built for Coach Gnaneswar Kokkirala</p>
        </div>
      </div>
    </footer>
  );
}
