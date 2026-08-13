'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Check, Dumbbell, ShieldAlert, Award, AlertCircle, Zap } from 'lucide-react';

interface Program {
  id: number;
  title: string;
  description: string;
  price: number;
  type: string;
}

const FALLBACK_PROGRAMS: Program[] = [
  {
    id: 1,
    title: "Beginner Strength Blueprint",
    description: "A perfect introduction to linear progression barbell training. Focuses on squats, deadlifts, overhead presses, and bench presses. Includes simple progression sheets.",
    price: 999,
    type: "workout"
  },
  {
    id: 2,
    title: "Aesthetic Muscle Builder (Hypertrophy)",
    description: "A 4-day upper/lower hypertrophy split designed to optimize volume and muscle group frequency. Perfect for lifters with 1+ years of consistent experience.",
    price: 1999,
    type: "workout"
  },
  {
    id: 3,
    title: "Ultimate Elite Shred & Diet Plan",
    description: "Our premium combined training and nutrition plan. Optimized for fat loss while maintaining maximum lean tissue. Includes diet templates, macro guides, and high-intensity conditioning routines.",
    price: 2999,
    type: "both"
  }
];

export default function Programs() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrograms() {
      try {
        const data = await apiFetch('/api/programs');
        setPrograms(data.length > 0 ? data : FALLBACK_PROGRAMS);
      } catch (err: any) {
        console.error("Failed to load programs, using fallback content", err);
        setPrograms(FALLBACK_PROGRAMS);
      } finally {
        setLoading(false);
      }
    }
    loadPrograms();
  }, []);

  const getProgramFeatures = (type: string) => {
    if (type === 'workout') {
      return [
        "Structured weekly training schedule",
        "Video library access for form checks",
        "RPE and load prescription guidelines",
        "Progressive overload log sheet template"
      ];
    } else if (type === 'diet') {
      return [
        "Calorie and protein target calculator",
        "Complete meal plan guides",
        "Vegetarian & Vegan substitute index",
        "Supplement stack recommendation guide"
      ];
    } else {
      return [
        "Full workout training schedules",
        "Complete daily macronutrient templates",
        "Conditioning & high-intensity interval routines",
        "Weekly progress review guidelines",
        "Priority email coaching support"
      ];
    }
  };

  return (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#050505] text-[#FFFFFF] space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#00BFFF] font-display">Training Catalogs</span>
        <h1 className="text-4xl sm:text-6xl font-black font-display text-white uppercase">
          COACHING <span className="cyan-gradient-text">PROGRAMS</span>
        </h1>
        <p className="text-[#8B949E] text-sm sm:text-base leading-relaxed">
          Choose a scientific path designed to trigger hyper-focused physical results. Start downloading templates instantly.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Dumbbell className="h-12 w-12 text-[#00BFFF] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programs.map((program) => {
            const features = getProgramFeatures(program.type);
            return (
              <div 
                key={program.id}
                className="card-classic p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex items-center space-x-1.5 bg-[#00BFFF]/10 border border-[#00BFFF]/30 px-3 py-1 rounded-full text-[#00BFFF] text-xs font-extrabold uppercase tracking-wide mb-6 font-display">
                    <Award className="h-3.5 w-3.5" />
                    <span>{program.type === 'both' ? 'Training + Diet' : `${program.type} split`}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{program.title}</h3>
                  <p className="text-[#8B949E] text-xs leading-relaxed mb-6">{program.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start space-x-2.5 text-xs text-[#E5E7EB]">
                        <Check className="h-4 w-4 text-[#00BFFF] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-6 border-t border-[#1C2329]">
                  <div className="flex items-baseline justify-between mb-6">
                    <span className="text-[#8B949E] text-xs font-semibold">One-time purchase</span>
                    <span className="text-3xl font-black font-display text-white">₹{program.price}</span>
                  </div>
                  
                  <Link 
                    href={`/pricing?select=${program.id}`}
                    className="w-full block text-center btn-primary py-3 text-xs font-extrabold"
                  >
                    Buy Program Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
