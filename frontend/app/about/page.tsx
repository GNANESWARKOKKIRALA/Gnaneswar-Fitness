'use client';

import Link from 'next/link';
import { Award, BookOpen, Target, CheckCircle, ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#050505] text-[#FFFFFF] space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#00BFFF] font-display">About The Coach</span>
        <h1 className="text-4xl sm:text-6xl font-black font-display text-white uppercase">
          MEET COACH <span className="cyan-gradient-text">GNANESWAR</span>
        </h1>
        <p className="text-[#8B949E] text-sm sm:text-base leading-relaxed">
          Helping athletes and high-performers build elite physiques using scientific weight training and structured diet design.
        </p>
      </div>

      {/* Grid: Bio & Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full overflow-hidden shadow-[0_0_35px_rgba(0,191,255,0.4)] border-4 border-[#00BFFF] logo-shine bg-[#0B0F12]">
            <img 
              src="/coach.jpg" 
              alt="Coach Gnaneswar" 
              className="h-full w-full object-cover hover:scale-110 transition-transform duration-700"
            />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-2xl sm:text-3xl font-black font-display text-white uppercase">
            COACHING WITH PURPOSE & <span className="cyan-gradient-text">SCIENCE</span>
          </h3>
          <p className="text-[#8B949E] text-sm leading-relaxed">
            I founded <strong className="text-white">Gnaneswar Fit</strong> because I was tired of seeing dedicated lifters waste months—or even years—in the gym doing random workouts and following unsustainable crash diets.
          </p>
          <p className="text-[#8B949E] text-sm leading-relaxed">
            My coaching approach is rooted strictly in exercise physiology and nutritional science. We program training blocks based on progressive overload, recovery management, and macro-based dieting models that produce real, lasting hypertrophy.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="flex items-start space-x-3 bg-[#111820] p-4 rounded-2xl border border-[#1C2329]">
              <CheckCircle className="h-5 w-5 text-[#00BFFF] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-bold text-xs">Evidence-Based Methods</h4>
                <p className="text-[#8B949E] text-[11px] mt-0.5">Programs built on peer-reviewed kinesiology and sports science research.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-[#111820] p-4 rounded-2xl border border-[#1C2329]">
              <CheckCircle className="h-5 w-5 text-[#00BFFF] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-bold text-xs">No-Crash Dieting</h4>
                <p className="text-[#8B949E] text-[11px] mt-0.5">Custom macros that preserve muscle mass and support metabolic health.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications and Pillars */}
      <div className="space-y-12">
        <h3 className="text-3xl font-black font-display text-white text-center uppercase">Credentials & Experience</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card-classic p-8 text-center space-y-4">
            <div className="mx-auto h-12 w-12 bg-[#00BFFF]/10 border border-[#00BFFF]/30 rounded-2xl flex items-center justify-center text-[#00BFFF]">
              <Award className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-extrabold text-white">CSCS Credential</h4>
            <p className="text-[#8B949E] text-xs leading-relaxed">Certified Strength & Conditioning Specialist - focusing on hypertrophy & peak recovery.</p>
          </div>

          <div className="card-classic p-8 text-center space-y-4">
            <div className="mx-auto h-12 w-12 bg-[#00BFFF]/10 border border-[#00BFFF]/30 rounded-2xl flex items-center justify-center text-[#00BFFF]">
              <BookOpen className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-extrabold text-white">Sports Nutritionist</h4>
            <p className="text-[#8B949E] text-xs leading-relaxed">Certified in macronutrient calculation, energy balancing, and metabolic adaptation.</p>
          </div>

          <div className="card-classic p-8 text-center space-y-4">
            <div className="mx-auto h-12 w-12 bg-[#00BFFF]/10 border border-[#00BFFF]/30 rounded-2xl flex items-center justify-center text-[#00BFFF]">
              <Target className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-extrabold text-white">20+ Transformations</h4>
            <p className="text-[#8B949E] text-xs leading-relaxed">Over 5 years of client-facing experience guiding fat loss, recomp, and bodybuilding preps.</p>
          </div>
        </div>
      </div>

      {/* Philosophy Callout */}
      <div className="card-classic p-8 sm:p-12 text-center max-w-4xl mx-auto border border-[#00BFFF]/30">
        <h3 className="text-2xl font-black font-display text-white mb-3 uppercase">"Consistency beats intensity. But intensity aligned with science beats everything."</h3>
        <p className="text-[#8B949E] max-w-xl mx-auto mb-6 text-xs leading-relaxed">
          If you are tired of working hard without seeing the mirror reflect your effort, it is time to upgrade your system. Let us design your roadmap today.
        </p>
        <Link 
          href="/pricing" 
          className="btn-primary px-8 py-3 text-xs font-extrabold shadow-lg inline-block"
        >
          Check Program Pricing
        </Link>
      </div>
    </div>
  );
}
