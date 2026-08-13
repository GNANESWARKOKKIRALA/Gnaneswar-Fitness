import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-[#00BFFF]/30 py-12 mt-auto relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 logo-shine">
              <div className="h-10 w-10 rounded-xl overflow-hidden border border-[#00BFFF]/40 shadow-[0_0_15px_rgba(0,191,255,0.2)] bg-[#0B0F12]">
                <img src="/logo.png?v=2" alt="Gnaneswar Fit Logo" className="h-full w-full object-cover" />
              </div>
              <span className="text-xl font-black font-display tracking-wider text-white uppercase">
                Gnaneswar<span className="cyan-gradient-text">FIT</span>
              </span>
            </div>
            <p className="text-xs text-[#8B949E] leading-relaxed">
              Elite bodybuilding coaching, customized progressive overload routines, and science-backed diet plans designed for maximum results by Coach Gnaneswar Kokkirala.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-[#00BFFF] uppercase tracking-wider mb-4 font-display">Navigation</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-xs text-[#8B949E] hover:text-[#00BFFF] transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/about" className="text-xs text-[#8B949E] hover:text-[#00BFFF] transition-colors">About Coach</Link>
              </li>
              <li>
                <Link href="/programs" className="text-xs text-[#8B949E] hover:text-[#00BFFF] transition-colors">Programs</Link>
              </li>
              <li>
                <Link href="/pricing" className="text-xs text-[#8B949E] hover:text-[#00BFFF] transition-colors">Pricing Options</Link>
              </li>
              <li>
                <Link href="/blog" className="text-xs text-[#8B949E] hover:text-[#00BFFF] transition-colors">Fitness Blog</Link>
              </li>
            </ul>
          </div>

          {/* Core Resources */}
          <div>
            <h3 className="text-xs font-bold text-[#00BFFF] uppercase tracking-wider mb-4 font-display">Resources</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/transformations" className="text-xs text-[#8B949E] hover:text-[#00BFFF] transition-colors">Client & Self Proof</Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs text-[#8B949E] hover:text-[#00BFFF] transition-colors">Support & Contact</Link>
              </li>
              <li>
                <Link href="/login" className="text-xs text-[#8B949E] hover:text-[#00BFFF] transition-colors">Admin Login</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-bold text-[#00BFFF] uppercase tracking-wider mb-4 font-display">Get In Touch</h3>
            <p className="text-xs text-[#8B949E] mb-1.5">Email: coach@gnaneswarfit.com</p>
            <p className="text-xs text-[#8B949E] mb-1.5">WhatsApp: +91 98765 43210</p>
            <p className="text-xs text-[#8B949E] mb-1.5">Instagram: @gnaneswar_fit</p>
            <p className="text-xs text-[#8B949E]">Location: Hyderabad, India</p>
          </div>
        </div>
        
        <div className="border-t border-[#1C2329] mt-10 pt-8 text-center flex flex-col sm:flex-row items-center justify-between text-xs text-[#8B949E]">
          <p>&copy; {new Date().getFullYear()} Gnaneswar Fit. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Built for Coach Gnaneswar Kokkirala</p>
        </div>
      </div>
    </footer>
  );
}
