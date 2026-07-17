'use client';

import Link from 'next/link';
import { Award, BookOpen, Target, CheckCircle } from 'lucide-react';

export default function About() {
  return (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-xs uppercase tracking-widest text-gold font-bold">About The Coach</h1>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
          MEET COACH GNANESWAR
        </h2>
        <p className="text-gray-400 mt-4 text-lg">
          Helping athletes and high-performers build elite physiques using scientific weight training and structured diet design.
        </p>
      </div>

      {/* Grid: Bio & Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-80 h-96 sm:w-96 sm:h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-card-border">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: "url('/coach.jpg')" 
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-2xl font-bold text-white">Coaching With Purpose & Science</h3>
          <p className="text-gray-300 leading-relaxed">
            I founded Gnaneswar_Fit because I was tired of seeing people waste months—or even years—in the gym doing random workouts and following crash diets that destroy their metabolic health. 
          </p>
          <p className="text-gray-300 leading-relaxed">
            My coaching approach is rooted strictly in exercise physiology and nutritional science. We design programs based on progressive overload, proper recovery periods, and flexible dieting structures that you can actually maintain.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-semibold">Evidence-Based Methods</h4>
                <p className="text-gray-400 text-xs mt-0.5">Programs built on peer-reviewed kinesiology and sports science research.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-semibold">No-Crash Dieting</h4>
                <p className="text-gray-400 text-xs mt-0.5">Custom macros that preserve muscle mass and support thyroid & hormone health.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications and Pillars */}
      <div className="mb-24">
        <h3 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">Credentials & Certifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 rounded-3xl border border-card-border text-center space-y-4">
            <div className="mx-auto h-12 w-12 bg-gold/10 border border-gold/20 rounded-2xl flex items-center justify-center text-gold">
              <Award className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-bold text-white">CSCS credential</h4>
            <p className="text-gray-400 text-sm">Certified Strength & Conditioning Specialist - focusing on muscle development & recovery.</p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-card-border text-center space-y-4">
            <div className="mx-auto h-12 w-12 bg-gold/10 border border-gold/20 rounded-2xl flex items-center justify-center text-gold">
              <BookOpen className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Sports Nutritionist</h4>
            <p className="text-gray-400 text-sm">Certified in macronutrient calculation, energy balancing, metabolic adaptation, and hydration.</p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-card-border text-center space-y-4">
            <div className="mx-auto h-12 w-12 bg-gold/10 border border-gold/20 rounded-2xl flex items-center justify-center text-gold">
              <Target className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-bold text-white">100+ Lived Results</h4>
            <p className="text-gray-400 text-sm">Over 4 years of client-facing experience guiding fat loss, recomp, and bodybuilding preps.</p>
          </div>
        </div>
      </div>

      {/* Philosophy Callout */}
      <div className="glass-panel rounded-3xl border border-card-border p-8 sm:p-12 text-center max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-white mb-4">"Consistency beats intensity. But intensity aligned with science beats everything."</h3>
        <p className="text-gray-400 max-w-xl mx-auto mb-6 text-sm">
          If you are tired of working hard without seeing the mirror reflect your effort, it is time to upgrade your system. Let us design your roadmap today.
        </p>
        <Link 
          href="/pricing" 
          className="gold-gradient-bg text-background font-bold px-8 py-3 rounded-full hover:scale-105 transition-all duration-300 inline-block"
        >
          Check Program Pricing
        </Link>
      </div>
    </div>
  );
}
