'use client';

import Link from 'next/link';
import { Shield, Award, Zap, TrendingUp, ArrowRight, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-20">
        {/* Background Image with Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80')" 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />

        {/* Glow circles behind elements */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold/5 rounded-full blur-[150px] pointer-events-none animate-rotate-slow" />

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left animate-slide-up">
            <div className="inline-flex items-center space-x-2 bg-gold/10 border border-gold/20 px-3 py-1 rounded-full text-gold text-sm font-semibold tracking-wide uppercase animate-pulse">
              <Zap className="h-4 w-4" />
              <span>Premium Coaching Portal</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-white">
              FORGE ELITE STRENGTH.<br />
              <span className="gold-gradient-text">BUILD YOUR LEGACY.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-300 max-w-lg leading-relaxed">
              Unlock elite-level physical conditioning. Experience professional, scientific bodybuilding routines, and optimized macronutrient diet structures tailored exclusively to your physique.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <Link 
                href="/pricing" 
                className="gold-gradient-bg text-background font-bold text-center px-8 py-4 rounded-full shadow-[0_0_20px_var(--gold-glow)] hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>View Elite Plans</span>
                <ArrowRight className="h-5 w-5 animate-pulse" />
              </Link>
              <Link 
                href="/programs" 
                className="bg-transparent border border-card-border hover:border-gold text-white hover:text-gold text-center font-bold px-8 py-4 rounded-full transition-all duration-300"
              >
                Explore Programs
              </Link>
            </div>
          </div>

          {/* Hero Coach Photo Showcase */}
          <div className="relative flex justify-center lg:justify-end animate-float">
            <div className="relative w-80 h-96 sm:w-96 sm:h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-card-border group hover:shadow-[0_0_25px_rgba(229,169,60,0.3)] transition-all duration-500">
              <div 
                className="absolute inset-0 bg-cover bg-center scale-105 group-hover:scale-100 transition-transform duration-700"
                style={{ 
                  backgroundImage: "url('/coach.jpg')" 
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent" />
              
              {/* Floating Stat card */}
              <div className="absolute bottom-6 left-6 right-6 glass-panel rounded-2xl p-4 border border-card-border animate-pulse-glow">
                <p className="text-xs uppercase tracking-wider text-gold font-bold">Head Coach</p>
                <h4 className="text-lg font-bold text-white">Gnaneswar Kokkirala</h4>
                <p className="text-xs text-gray-400">Certified Strength & Conditioning Specialist</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Stats Strip */}
      <section className="relative bg-[#050507] border-y border-card-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl sm:text-5xl font-black text-white gold-gradient-text">4+</p>
              <p className="text-xs sm:text-sm uppercase tracking-wider text-gray-400 mt-1">Years of Coaching</p>
            </div>
            <div>
              <p className="text-3xl sm:text-5xl font-black text-white gold-gradient-text">20+</p>
              <p className="text-xs sm:text-sm uppercase tracking-wider text-gray-400 mt-1">Active Clients</p>
            </div>
            <div>
              <p className="text-3xl sm:text-5xl font-black text-white gold-gradient-text">98%</p>
              <p className="text-xs sm:text-sm uppercase tracking-wider text-gray-400 mt-1">Success Rate</p>
            </div>
            <div>
              <p className="text-3xl sm:text-5xl font-black text-white gold-gradient-text">10+</p>
              <p className="text-xs sm:text-sm uppercase tracking-wider text-gray-400 mt-1">Pro Transformations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-gold font-bold">Why Gnaneswar_Fit</h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
              Our Core Coaching Pillars
            </h3>
            <p className="text-gray-400 mt-4">
              We combine scientific coaching principles with state-of-the-art support systems to bring you the best bodybuilding journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="glass-panel p-8 rounded-3xl border border-card-border hover-card-trigger">
              <div className="h-12 w-12 bg-gold/10 border border-gold/20 rounded-2xl flex items-center justify-center text-gold mb-6 animate-pulse">
                <Award className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Scientific Blueprints</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                No guesswork. We program training blocks with precise parameters: sets, reps, load ranges, RPE targets, and recovery rules tailored for your goals.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="glass-panel p-8 rounded-3xl border border-card-border hover-card-trigger">
              <div className="h-12 w-12 bg-gold/10 border border-gold/20 rounded-2xl flex items-center justify-center text-gold mb-6 animate-pulse">
                <Shield className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Macro-Based Dieting</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Flexible and strict plans depending on your preference. Complete breakdowns of daily proteins, carbs, fats, calories, and supplementation strategies.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="glass-panel p-8 rounded-3xl border border-card-border hover-card-trigger">
              <div className="h-12 w-12 bg-gold/10 border border-gold/20 rounded-2xl flex items-center justify-center text-gold mb-6 animate-pulse">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Progress Logs</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Track your scale weight, body measurements, and photo logs over time to visualize progress and allow the coach to make data-backed adjustments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Transformations Section */}
      <section className="py-24 bg-[#050507] border-t border-card-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16">
            <div>
              <h2 className="text-xs uppercase tracking-widest text-gold font-bold">Real Results</h2>
              <h3 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">Gravity-Defying Shifts</h3>
            </div>
            <Link href="/transformations" className="text-gold hover:text-white transition-colors font-bold mt-4 md:mt-0 flex items-center space-x-2">
              <span>View transformation gallery</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="glass-panel rounded-3xl overflow-hidden border border-card-border flex flex-col sm:flex-row h-full">
              <div className="w-full sm:w-1/2 h-64 sm:h-auto relative bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80')" }}>
                <span className="absolute top-4 left-4 bg-gold text-background text-xs font-bold px-3 py-1 rounded-full uppercase">12 Weeks Fat Loss</span>
              </div>
              <div className="w-full sm:w-1/2 p-8 flex flex-col justify-center space-y-4">
                <div className="flex text-gold">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <blockquote className="text-gray-300 text-sm italic leading-relaxed">
                  "The nutrition templates and weekly adjustments were perfect. I shredded 15kg without crashing my metabolism or strength levels."
                </blockquote>
                <div>
                  <h4 className="text-white font-bold">Alex Carter</h4>
                  <p className="text-xs text-gray-500">Business Analyst</p>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl overflow-hidden border border-card-border flex flex-col sm:flex-row h-full">
              <div className="w-full sm:w-1/2 h-64 sm:h-auto relative bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80')" }}>
                <span className="absolute top-4 left-4 bg-gold text-background text-xs font-bold px-3 py-1 rounded-full uppercase">Hypertrophy Goal</span>
              </div>
              <div className="w-full sm:w-1/2 p-8 flex flex-col justify-center space-y-4">
                <div className="flex text-gold">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <blockquote className="text-gray-300 text-sm italic leading-relaxed">
                  "I was stuck at the same bodyweight for years. The structured progressive overload strategy helped me break plateaus in weeks."
                </blockquote>
                <div>
                  <h4 className="text-white font-bold">Sarah Jenkins</h4>
                  <p className="text-xs text-gray-500">Full-Stack Engineer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background border-t border-card-border relative">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
            Ready to Build Your Elite Physique?
          </h2>
          <p className="text-gray-300 text-lg max-w-xl mx-auto leading-relaxed">
            Stop guessing, start lifting. Lock in your customized training program, receive complete diet macro models, and start logging your progress today.
          </p>
          <div className="flex justify-center">
            <Link 
              href="/pricing" 
              className="gold-gradient-bg text-background font-black text-center px-10 py-5 rounded-full shadow-[0_0_25px_var(--gold-glow)] hover:scale-105 transition-all duration-300 text-lg"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
