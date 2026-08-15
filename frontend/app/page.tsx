'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  ArrowRight, 
  Star, 
  Dumbbell, 
  Award, 
  ShieldCheck, 
  Activity, 
  Play, 
  Check, 
  Send,
  MessageSquare,
  Flame,
  Target,
  Layers,
  Clock,
  Sparkles
} from 'lucide-react';
import { apiFetch, resolveMediaUrl } from '@/lib/api';

export default function Home() {
  // Transformations State
  const [transformations, setTransformations] = useState<any[]>([]);
  const [selectedGoal, setSelectedGoal] = useState('ALL');
  const [stats, setStats] = useState<{ clients_count: number; transformations_count: number }>({ clients_count: 0, transformations_count: 0 });
  const [homepageSections, setHomepageSections] = useState<any[]>([]);
  
  // Workouts State
  const [selectedWorkoutCategory, setSelectedWorkoutCategory] = useState('Chest');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactGoal, setContactGoal] = useState('Fat Loss & Conditioning');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Fetch client transformations & real DB stats dynamically
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [data, statsData, sectionsData] = await Promise.all([
          apiFetch('/api/client-transformations').catch(() => []),
          apiFetch('/api/client-transformations/public-stats').catch(() => ({ clients_count: 0, transformations_count: 0 })),
          apiFetch('/api/homepage').catch(() => [])
        ]);
        setTransformations(data || []);
        if (statsData) {
          setStats(statsData);
        }
        if (sectionsData) {
          setHomepageSections(sectionsData);
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      }
    };
    fetchHomeData();
  }, []);

  const workoutCategories = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Push', 'Pull'];

  const workoutData: Record<string, Array<{ exercise: string; sets: string; reps: string; rest: string; difficulty: string }>> = {
    Chest: [
      { exercise: 'Incline Barbell Bench Press', sets: '4 Sets', reps: '6 - 8 Reps', rest: '120 sec', difficulty: 'Advanced' },
      { exercise: 'Flat Dumbbell Press', sets: '4 Sets', reps: '8 - 10 Reps', rest: '90 sec', difficulty: 'Intermediate' },
      { exercise: 'Cable Chest Flyes (Low to High)', sets: '3 Sets', reps: '12 - 15 Reps', rest: '60 sec', difficulty: 'All Levels' },
      { exercise: 'Weighted Chest Dips', sets: '3 Sets', reps: '8 - 12 Reps', rest: '90 sec', difficulty: 'Advanced' },
    ],
    Back: [
      { exercise: 'Barbell Bent-Over Rows', sets: '4 Sets', reps: '6 - 8 Reps', rest: '120 sec', difficulty: 'Advanced' },
      { exercise: 'Lat Pulldown (Neutral Grip)', sets: '4 Sets', reps: '10 - 12 Reps', rest: '90 sec', difficulty: 'Intermediate' },
      { exercise: 'Seated Cable Row (Wide Grip)', sets: '3 Sets', reps: '10 - 12 Reps', rest: '60 sec', difficulty: 'Intermediate' },
      { exercise: 'Rack Pulls (Below Knee)', sets: '3 Sets', reps: '5 - 6 Reps', rest: '150 sec', difficulty: 'Advanced' },
    ],
    Shoulders: [
      { exercise: 'Seated Overhead Dumbbell Press', sets: '4 Sets', reps: '8 - 10 Reps', rest: '90 sec', difficulty: 'Intermediate' },
      { exercise: 'Egyptian Cable Lateral Raises', sets: '4 Sets', reps: '12 - 15 Reps', rest: '60 sec', difficulty: 'All Levels' },
      { exercise: 'Reverse Pec Deck Rear Flyes', sets: '4 Sets', reps: '15 Reps', rest: '60 sec', difficulty: 'Intermediate' },
      { exercise: 'Heavy Barbell Shrugs', sets: '3 Sets', reps: '10 Reps', rest: '90 sec', difficulty: 'Advanced' },
    ],
    Arms: [
      { exercise: 'Ez-Bar Bicep Preacher Curls', sets: '4 Sets', reps: '10 - 12 Reps', rest: '60 sec', difficulty: 'Intermediate' },
      { exercise: 'Tricep Rope Pushdowns', sets: '4 Sets', reps: '12 - 15 Reps', rest: '60 sec', difficulty: 'All Levels' },
      { exercise: 'Incline Dumbbell Bicep Curls', sets: '3 Sets', reps: '10 - 12 Reps', rest: '60 sec', difficulty: 'Intermediate' },
      { exercise: 'Skull Crushers (Lying Ez-Bar)', sets: '3 Sets', reps: '8 - 10 Reps', rest: '90 sec', difficulty: 'Advanced' },
    ],
    Legs: [
      { exercise: 'Barbell High-Bar Back Squats', sets: '4 Sets', reps: '6 - 8 Reps', rest: '150 sec', difficulty: 'Advanced' },
      { exercise: 'Romanian Deadlifts (RDL)', sets: '4 Sets', reps: '8 - 10 Reps', rest: '120 sec', difficulty: 'Advanced' },
      { exercise: 'Leg Press (Quad-Focused)', sets: '4 Sets', reps: '10 - 12 Reps', rest: '90 sec', difficulty: 'Intermediate' },
      { exercise: 'Standing Calf Raises', sets: '4 Sets', reps: '15 - 20 Reps', rest: '45 sec', difficulty: 'All Levels' },
    ],
    Push: [
      { exercise: 'Incline Smith Machine Press', sets: '4 Sets', reps: '6 - 8 Reps', rest: '120 sec', difficulty: 'Advanced' },
      { exercise: 'Standing Military Overhead Press', sets: '3 Sets', reps: '8 - 10 Reps', rest: '90 sec', difficulty: 'Advanced' },
      { exercise: 'Cable Upper Chest Flyes', sets: '3 Sets', reps: '12 Reps', rest: '60 sec', difficulty: 'Intermediate' },
      { exercise: 'Overhead Tricep Extension', sets: '4 Sets', reps: '12 - 15 Reps', rest: '60 sec', difficulty: 'Intermediate' },
    ],
    Pull: [
      { exercise: 'Weighted Pull-Ups', sets: '4 Sets', reps: '6 - 8 Reps', rest: '120 sec', difficulty: 'Advanced' },
      { exercise: 'Meadows Single-Arm Row', sets: '3 Sets', reps: '8 - 10 Reps', rest: '90 sec', difficulty: 'Intermediate' },
      { exercise: 'Face Pulls with Rope', sets: '4 Sets', reps: '15 Reps', rest: '60 sec', difficulty: 'All Levels' },
      { exercise: 'Hammer Dumbbell Curls', sets: '3 Sets', reps: '10 - 12 Reps', rest: '60 sec', difficulty: 'Intermediate' },
    ],
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactMessage('');
      setContactSubmitted(false);
    }, 4000);
  };

  const filteredTransformations = selectedGoal === 'ALL'
    ? transformations
    : transformations.filter(t => t.goal?.toUpperCase().includes(selectedGoal.replace(' ', '')));

  const getSection = (id: string) => homepageSections.find(s => s.section_id === id);
  const hero = getSection('hero');
  const about = getSection('about');
  const cta = getSection('cta');

  return (
    <div className="relative w-full overflow-hidden bg-[#050505] text-[#FFFFFF]">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center py-20 overflow-hidden">
        {/* Gym Workspace Background - HIGH VISIBILITY */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-55 scale-105"
          style={{ 
            backgroundImage: `url('${hero?.image_url ? resolveMediaUrl(hero.image_url) : "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=90"}')` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/50 to-[#050505]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        
        {/* Cyan Ambient Light */}
        <div className="absolute top-1/4 left-10 w-80 h-80 bg-[#00BFFF]/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#008CFF]/6 rounded-full blur-[140px] pointer-events-none" />

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 bg-[#00BFFF]/10 border border-[#00BFFF]/30 px-4 py-1.5 rounded-full text-[#00BFFF] text-xs font-extrabold tracking-widest uppercase">
              <Zap className="h-4 w-4 text-[#00BFFF]" />
              <span>{hero?.subtitle || 'Official Gnaneswar Fit Coaching'}</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black font-display tracking-tight leading-none text-white whitespace-pre-line">
              {hero?.title ? (
                hero.title.includes('STRONGEST VERSION') ? (
                  <>BUILD YOUR <br /><span className="cyan-gradient-text">STRONGEST VERSION</span></>
                ) : (
                  hero.title
                )
              ) : (
                <>BUILD YOUR <br /><span className="cyan-gradient-text">STRONGEST VERSION</span></>
              )}
            </h1>
            
            <p className="text-lg sm:text-xl text-[#E5E7EB] font-semibold max-w-xl leading-relaxed whitespace-pre-line">
              {hero?.content ? hero.content.split('\n')[0] : 'Train harder. Eat smarter. Improve every day.'}
            </p>

            <p className="text-xs sm:text-sm text-[#8B949E] max-w-lg leading-relaxed whitespace-pre-line">
              {hero?.content ? hero.content.split('\n').slice(1).join('\n') : 'Evidence-backed progressive overload blueprints, macro-modeled nutrition plans, and 1-on-1 contest prep designed exclusively by Coach Gnaneswar Kokkirala.'}
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <Link 
                href={hero?.cta_url || "/contact"} 
                className="btn-primary text-center px-9 py-4 text-sm font-extrabold flex items-center justify-center space-x-2"
              >
                <span>{hero?.cta_text?.toUpperCase() || 'START TRAINING'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                href="/transformations" 
                className="btn-secondary text-center px-8 py-4 text-sm font-bold"
              >
                VIEW TRANSFORMATIONS
              </Link>
            </div>
          </div>

          {/* Hero Coach Circle DP Showcase */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center space-y-4">
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full overflow-hidden shadow-[0_0_35px_rgba(0,191,255,0.4)] border-4 border-[#00BFFF] group hover:scale-105 transition-all duration-500 logo-shine bg-[#0B0F12]">
              <img 
                src="/coach.jpg" 
                alt="Coach Gnaneswar"
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>

            {/* Coach Label Badge */}
            <div className="glass-panel rounded-2xl px-6 py-3 border border-[#00BFFF]/40 text-center shadow-xl">
              <p className="text-[10px] uppercase tracking-widest text-[#00BFFF] font-extrabold font-display">Head Coach & Founder</p>
              <h4 className="text-lg font-black font-display text-white">GNANESWAR KOKKIRALA</h4>
              <p className="text-[11px] text-[#8B949E]">Certified Strength & Conditioning Specialist</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT & STATS SECTION */}
      <section className="relative bg-[#0B0F12] border-y border-[#1C2329] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#00BFFF] font-display">{about?.subtitle || 'About The Brand'}</span>
              <h2 className="text-4xl sm:text-6xl font-black font-display text-white leading-tight">
                {about?.title || <>ELITE COACHING FOR <span className="cyan-gradient-text">NATURAL HYPERTROPHY</span></>}
              </h2>
              <p className="text-[#8B949E] text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {about?.content || <>At <strong className="text-white">Gnaneswar Fit</strong>, we eliminate guesswork from bodybuilding. Every training split, progressive loading target, and macronutrient recommendation is calculated specifically for your body type and performance goals.</>}
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs font-bold text-[#E5E7EB]">
                <div className="flex items-center space-x-2 bg-[#111820] p-3 rounded-xl border border-[#1C2329]">
                  <Check className="h-4 w-4 text-[#00BFFF]" />
                  <span>Custom Macro Plans</span>
                </div>
                <div className="flex items-center space-x-2 bg-[#111820] p-3 rounded-xl border border-[#1C2329]">
                  <Check className="h-4 w-4 text-[#00BFFF]" />
                  <span>Logbook Progress Tracking</span>
                </div>
                <div className="flex items-center space-x-2 bg-[#111820] p-3 rounded-xl border border-[#1C2329]">
                  <Check className="h-4 w-4 text-[#00BFFF]" />
                  <span>Form Check Reviews</span>
                </div>
                <div className="flex items-center space-x-2 bg-[#111820] p-3 rounded-xl border border-[#1C2329]">
                  <Check className="h-4 w-4 text-[#00BFFF]" />
                  <span>Direct WhatsApp Access</span>
                </div>
              </div>
            </div>

            {/* Dynamic Real DB Stat Counters */}
            <div className="grid grid-cols-2 gap-6">
              <div className="card-classic p-8 text-center space-y-2">
                <p className="text-4xl sm:text-6xl font-black font-display cyan-gradient-text">
                  {stats.transformations_count || transformations.length || 0}
                </p>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Client Transformations</p>
                <p className="text-[11px] text-[#8B949E]">Verified fat loss & hypertrophy results</p>
              </div>

              <div className="card-classic p-8 text-center space-y-2">
                <p className="text-4xl sm:text-6xl font-black font-display cyan-gradient-text">
                  {stats.clients_count || 0}
                </p>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Registered Clients</p>
                <p className="text-[11px] text-[#8B949E]">Active enrolled coaching accounts</p>
              </div>

              <div className="card-classic p-8 text-center space-y-2">
                <p className="text-4xl sm:text-6xl font-black font-display cyan-gradient-text">100%</p>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Personalized Plans</p>
                <p className="text-[11px] text-[#8B949E]">Zero cookie-cutter routines</p>
              </div>

              <div className="card-classic p-8 text-center space-y-2">
                <p className="text-4xl sm:text-6xl font-black font-display cyan-gradient-text">24/7</p>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Fitness Guidance</p>
                <p className="text-[11px] text-[#8B949E]">Continuous support & messaging</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRANSFORMATIONS SECTION */}
      <section className="py-24 bg-[#050505] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#00BFFF] font-display">Real Client Results</span>
            <h2 className="text-4xl sm:text-6xl font-black font-display text-white uppercase">
              TRANSFORMATION <span className="cyan-gradient-text">SHOWCASE</span>
            </h2>
            <p className="text-[#8B949E] text-sm">
              Explore documented before and after physique shifts built with dedicated progressive overload.
            </p>
          </div>

          {/* Goal Filter Pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {['ALL', 'MUSCLE GAIN', 'FAT LOSS', 'TRANSFORMATION'].map((goal) => (
              <button
                key={goal}
                onClick={() => setSelectedGoal(goal)}
                className={`px-5 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-300 ${
                  selectedGoal === goal
                    ? 'cyan-gradient-bg text-[#050505] shadow-[0_0_15px_rgba(0,191,255,0.4)]'
                    : 'border border-[#1C2329] text-gray-300 hover:border-[#00BFFF] hover:text-white bg-[#0B0F12]'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>

          {/* Transformations Grid */}
          {filteredTransformations.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Fallback Static Cards */}
              <div className="card-classic p-6 space-y-6">
                <div className="grid grid-cols-2 gap-3 h-64 overflow-hidden rounded-2xl bg-black">
                  <img src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80" alt="Before" className="h-full w-full object-cover" />
                  <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80" alt="After" className="h-full w-full object-cover" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-white">Alex Carter</h4>
                    <span className="text-[10px] px-3 py-1 bg-[#00BFFF]/20 text-[#00BFFF] font-extrabold rounded-full uppercase">12 Weeks • Fat Loss</span>
                  </div>
                  <p className="text-xs text-[#8B949E] leading-relaxed">
                    Dropped 14kg of body fat while increasing squat and deadlift maxes through structured macro cycling.
                  </p>
                </div>
              </div>

              <div className="card-classic p-6 space-y-6">
                <div className="grid grid-cols-2 gap-3 h-64 overflow-hidden rounded-2xl bg-black">
                  <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80" alt="Before" className="h-full w-full object-cover" />
                  <img src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80" alt="After" className="h-full w-full object-cover" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-white">Vikram Rao</h4>
                    <span className="text-[10px] px-3 py-1 bg-[#00BFFF]/20 text-[#00BFFF] font-extrabold rounded-full uppercase">16 Weeks • Muscle Gain</span>
                  </div>
                  <p className="text-xs text-[#8B949E] leading-relaxed">
                    Packed on 7kg of lean muscle mass during a controlled lean bulking split with zero fat spillover.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTransformations.map((item) => (
                <div key={item.id} className="card-classic p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-2 h-56 overflow-hidden rounded-xl bg-black">
                    <img src={resolveMediaUrl(item.before_img)} alt="Before" className="h-full w-full object-cover" />
                    <img src={resolveMediaUrl(item.after_img)} alt="After" className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">{item.client_name}</h4>
                      <span className="text-[9px] px-2.5 py-0.5 bg-[#00BFFF]/20 text-[#00BFFF] font-extrabold rounded-full uppercase">
                        {item.duration || '12 Weeks'}
                      </span>
                    </div>
                    <p className="text-xs text-[#8B949E] line-clamp-2">{item.story}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              href="/transformations"
              className="inline-flex items-center space-x-2 text-xs font-extrabold text-[#00BFFF] hover:text-white transition-colors uppercase tracking-wider"
            >
              <span>View Full Transformation & Video Gallery</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. WORKOUT BLUEPRINTS SECTION */}
      <section id="workouts" className="py-24 bg-[#0B0F12] border-y border-[#1C2329] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#00BFFF] font-display">Training Routines</span>
            <h2 className="text-4xl sm:text-6xl font-black font-display text-white uppercase">
              PROFESSIONAL <span className="cyan-gradient-text">WORKOUT BLUEPRINTS</span>
            </h2>
            <p className="text-[#8B949E] text-sm">
              Structured progressive overload splits designed for hypertrophy, muscle symmetry, and raw strength.
            </p>
          </div>

          {/* Workout Categories Navigation */}
          <div className="flex flex-wrap gap-2 justify-center">
            {workoutCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedWorkoutCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-300 ${
                  selectedWorkoutCategory === cat
                    ? 'cyan-gradient-bg text-[#050505] shadow-[0_0_15px_rgba(0,191,255,0.4)]'
                    : 'border border-[#1C2329] text-gray-300 hover:border-[#00BFFF] hover:text-white bg-[#111820]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Exercises Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workoutData[selectedWorkoutCategory]?.map((item, idx) => (
              <div key={idx} className="card-classic p-6 space-y-4 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#00BFFF] font-extrabold uppercase tracking-wider">{selectedWorkoutCategory} Split</span>
                    <h3 className="text-lg font-bold text-white">{item.exercise}</h3>
                  </div>
                  <span className="text-[10px] px-3 py-1 bg-[#00BFFF]/10 border border-[#00BFFF]/30 text-[#00BFFF] rounded-full font-bold">
                    {item.difficulty}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#1C2329] text-xs">
                  <div className="flex items-center space-x-2">
                    <Layers className="h-4 w-4 text-[#00BFFF]" />
                    <div>
                      <p className="text-[9px] text-[#8B949E] uppercase font-semibold">Volume</p>
                      <p className="font-bold text-white">{item.sets}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-[#00BFFF]" />
                    <div>
                      <p className="text-[9px] text-[#8B949E] uppercase font-semibold">Rep Range</p>
                      <p className="font-bold text-white">{item.reps}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-[#00BFFF]" />
                    <div>
                      <p className="text-[9px] text-[#8B949E] uppercase font-semibold">Rest Time</p>
                      <p className="font-bold text-white">{item.rest}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FITNESS MAGAZINE BLOG PREVIEW */}
      <section className="py-24 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#00BFFF] font-display">Fitness Science</span>
              <h2 className="text-4xl sm:text-6xl font-black font-display text-white mt-1 uppercase">
                THE BODYBUILDING <span className="cyan-gradient-text">MAGAZINE</span>
              </h2>
            </div>
            <Link href="/blog" className="text-xs font-extrabold text-[#00BFFF] hover:text-white transition-colors mt-4 md:mt-0 flex items-center space-x-1 uppercase tracking-wider">
              <span>View All Articles</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <article className="card-classic overflow-hidden flex flex-col group">
              <div className="h-48 bg-black overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80" alt="Blog" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 bg-[#00BFFF] text-[#050505] text-[10px] font-black uppercase px-3 py-1 rounded-full">Hypertrophy</span>
              </div>
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#00BFFF] transition-colors line-clamp-2">
                    Mastering Progressive Overload for Maximum Muscle Growth
                  </h3>
                  <p className="text-xs text-[#8B949E] line-clamp-3 leading-relaxed">
                    Learn how to structure load increases, volume accumulation, and deload blocks to build natural muscle consistently.
                  </p>
                </div>
                <Link href="/blog" className="text-xs font-bold text-[#00BFFF] inline-flex items-center space-x-1 pt-2 border-t border-[#1C2329]">
                  <span>Read Full Article</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>

            <article className="card-classic overflow-hidden flex flex-col group">
              <div className="h-48 bg-black overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80" alt="Blog" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 bg-[#00BFFF] text-[#050505] text-[10px] font-black uppercase px-3 py-1 rounded-full">Nutrition</span>
              </div>
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#00BFFF] transition-colors line-clamp-2">
                    The Science of Caloric Deficits & Protein Distribution
                  </h3>
                  <p className="text-xs text-[#8B949E] line-clamp-3 leading-relaxed">
                    Preserve muscle tissue while dropping stubborn fat. Macro ratios and timing models for lean conditioning.
                  </p>
                </div>
                <Link href="/blog" className="text-xs font-bold text-[#00BFFF] inline-flex items-center space-x-1 pt-2 border-t border-[#1C2329]">
                  <span>Read Full Article</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>

            <article className="card-classic overflow-hidden flex flex-col group">
              <div className="h-48 bg-black overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80" alt="Blog" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 bg-[#00BFFF] text-[#050505] text-[10px] font-black uppercase px-3 py-1 rounded-full">Recovery</span>
              </div>
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#00BFFF] transition-colors line-clamp-2">
                    Sleep Architecture & Nervous System Recovery
                  </h3>
                  <p className="text-xs text-[#8B949E] line-clamp-3 leading-relaxed">
                    Why CNS fatigue dictates your strength gains and how optimization protocols accelerate progress.
                  </p>
                </div>
                <Link href="/blog" className="text-xs font-bold text-[#00BFFF] inline-flex items-center space-x-1 pt-2 border-t border-[#1C2329]">
                  <span>Read Full Article</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 6. CONTACT & CTA SECTION */}
      <section className="py-24 bg-[#0B0F12] border-t border-[#1C2329] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
          <div className="space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#00BFFF] font-display">Start Your Journey</span>
            <h2 className="text-4xl sm:text-6xl font-black font-display text-white uppercase">
              READY TO <span className="cyan-gradient-text">TRANSFORM?</span>
            </h2>
            <p className="text-[#8B949E] text-base max-w-xl mx-auto">
              Start your fitness journey with Coach Gnaneswar Fit. Receive custom workout blueprints, diet plans, and continuous accountability.
            </p>
          </div>

          <div className="card-classic p-8 sm:p-10 text-left border border-[#00BFFF]/30 shadow-2xl">
            {contactSubmitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="h-14 w-14 rounded-full bg-[#00BFFF]/20 border border-[#00BFFF] flex items-center justify-center text-[#00BFFF] mx-auto">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black font-display text-white">APPLICATION RECEIVED!</h3>
                <p className="text-xs text-[#8B949E]">Coach Gnaneswar will contact you on WhatsApp / Email within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      className="w-full bg-[#050505] border border-[#1C2329] focus:border-[#00BFFF] rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full bg-[#050505] border border-[#1C2329] focus:border-[#00BFFF] rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300">Phone Number / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#050505] border border-[#1C2329] focus:border-[#00BFFF] rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-300">Primary Goal</label>
                    <select
                      value={contactGoal}
                      onChange={(e) => setContactGoal(e.target.value)}
                      className="w-full bg-[#050505] border border-[#1C2329] focus:border-[#00BFFF] rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    >
                      <option value="Fat Loss & Conditioning">Fat Loss & Conditioning</option>
                      <option value="Muscle Hypertrophy">Muscle Hypertrophy</option>
                      <option value="Strength & Powerlifting">Strength & Powerlifting</option>
                      <option value="Contest Preparation">Contest Preparation</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">Tell Us About Your Fitness Background</label>
                  <textarea
                    rows={3}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Mention current weight, training history, and goals..."
                    className="w-full bg-[#050505] border border-[#1C2329] focus:border-[#00BFFF] rounded-xl p-4 text-xs text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-4 text-sm font-extrabold flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(0,191,255,0.4)]"
                >
                  <Send className="h-4 w-4" />
                  <span>START MY TRANSFORMATION</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
