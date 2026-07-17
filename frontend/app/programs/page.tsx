'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Check, Dumbbell, ShieldAlert, Award, AlertCircle } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);

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
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-xs uppercase tracking-widest text-gold font-bold">Training Catalogs</h1>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
          Coaching Programs
        </h2>
        <p className="text-gray-400 mt-4 text-lg">
          Choose a scientific path designed to trigger hyper-focused physical results. Start downloading templates instantly.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Dumbbell className="h-12 w-12 text-gold animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programs.map((program) => {
            const features = getProgramFeatures(program.type);
            return (
              <div 
                key={program.id}
                className="glass-panel rounded-3xl border border-card-border p-8 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300"
              >
                <div>
                  <div className="inline-flex items-center space-x-1.5 bg-gold/10 border border-gold/20 px-3 py-1 rounded-full text-gold text-xs font-semibold uppercase tracking-wide mb-6">
                    <Award className="h-3.5 w-3.5" />
                    <span>{program.type === 'both' ? 'Training + Diet' : `${program.type} split`}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{program.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">{program.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start space-x-2.5 text-sm text-gray-300">
                        <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-6 border-t border-card-border">
                  <div className="flex items-baseline justify-between mb-6">
                    <span className="text-gray-400 text-sm font-semibold">One-time purchase</span>
                    <span className="text-3xl font-black text-white">₹{program.price}</span>
                  </div>
                  
                  <Link 
                    href={`/pricing?select=${program.id}`}
                    className="w-full block text-center bg-transparent border border-gold text-gold hover:bg-gold hover:text-background font-bold py-3 rounded-full transition-all duration-300"
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
