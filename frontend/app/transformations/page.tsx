'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Trophy, Activity, Dumbbell, Star, Quote } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface ClientTransformation {
  id: number;
  name: string;
  age: number;
  goal: 'fat loss' | 'muscle gain';
  beforeWeight: string;
  afterWeight: string;
  duration: string;
  story: string;
  beforeImg: string;
  afterImg: string;
  afterImg2?: string;
  isSelf?: boolean;
}

const DEFAULT_CLIENT_TRANSFORMATIONS: ClientTransformation[] = [
  {
    id: 1003,
    name: "Alex Carter",
    age: 28,
    goal: "fat loss",
    beforeWeight: "92 kg",
    afterWeight: "77 kg",
    duration: "12 Weeks",
    story: "Alex was struggling with consistency and calorie control. With the Elite Shred Plan, we programmed a slow caloric deficit combined with dense resistance sets. He preserved all of his muscle mass and dropped 15kg of body fat.",
    beforeImg: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80",
    afterImg: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
    isSelf: false
  },
  {
    id: 1004,
    name: "Sarah Jenkins",
    age: 31,
    goal: "muscle gain",
    beforeWeight: "54 kg",
    afterWeight: "58 kg",
    duration: "16 Weeks",
    story: "Sarah wanted to shape her shoulders and back while gaining strength. By utilizing our Aesthetic Hypertrophy Upper/Lower split and a structured caloric surplus, she added 4kg of pure lean mass and hit new personal records on all main lifts.",
    beforeImg: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80",
    afterImg: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80",
    isSelf: false
  }
];

const DEFAULT_COACH_TRANSFORMATION: ClientTransformation = {
  id: 9999,
  name: "Gnaneswar Kokkirala (Coach)",
  age: 22,
  goal: "muscle gain",
  beforeWeight: "60 kg",
  afterWeight: "70 kg",
  duration: "24 Weeks",
  story: "My personal double biceps and aesthetic development. By utilizing a structured progressive overload compound routine, custom macro adjustments, and a clean caloric surplus, I added 10kg of lean muscle mass while keeping body fat minimal.",
  beforeImg: "http://127.0.0.1:8000/uploads/before_self.jpg",
  afterImg: "http://127.0.0.1:8000/uploads/after_self.jpg",
  afterImg2: "http://127.0.0.1:8000/uploads/after_side_self.jpg",
  isSelf: true
};

export default function Transformations() {
  const [filter, setFilter] = useState<'all' | 'fat loss' | 'muscle gain'>('all');
  const [dbTransformations, setDbTransformations] = useState<ClientTransformation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransformations = async () => {
      try {
        const rawList = await apiFetch('/api/transformations');
        const formatted: ClientTransformation[] = rawList.map((item: any) => {
          let name = "Success Story";
          let age = 25;
          let goal: 'fat loss' | 'muscle gain' = "fat loss";
          let beforeWeight = "N/A";
          let afterWeight = "N/A";
          let duration = "N/A";
          let story = item.story;
          let isSelf = false;
          let afterImg2 = undefined;

          // Parse JSON if applicable
          if (item.story && item.story.trim().startsWith('{')) {
            try {
              const parsed = JSON.parse(item.story);
              name = parsed.client_name || name;
              age = parsed.client_age || age;
              goal = parsed.client_goal || goal;
              beforeWeight = parsed.before_weight || beforeWeight;
              afterWeight = parsed.after_weight || afterWeight;
              duration = parsed.duration || duration;
              story = parsed.story_text || story;
              isSelf = !!parsed.is_self;
              if (parsed.after_img_2) {
                afterImg2 = parsed.after_img_2.startsWith('/')
                  ? `http://127.0.0.1:8000${parsed.after_img_2}`
                  : parsed.after_img_2;
              }
            } catch (err) {
              console.error("JSON parse error:", err);
            }
          }

          return {
            id: item.id,
            name,
            age,
            goal,
            beforeWeight,
            afterWeight,
            duration,
            story,
            beforeImg: item.before_img.startsWith('/') ? `http://127.0.0.1:8000${item.before_img}` : item.before_img,
            afterImg: item.after_img.startsWith('/') ? `http://127.0.0.1:8000${item.after_img}` : item.after_img,
            afterImg2,
            isSelf
          };
        });
        setDbTransformations(formatted);
      } catch (err) {
        console.error("Error fetching db transformations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransformations();
  }, []);

  const allItems = [...dbTransformations, DEFAULT_COACH_TRANSFORMATION];
  
  // Extract coach self transformations
  const coachTransItems = allItems.filter(item => item.isSelf);
  const activeCoachTrans = coachTransItems.length > 0 ? coachTransItems[0] : DEFAULT_COACH_TRANSFORMATION;

  // Extract client transformations
  const clientTransItems = [
    ...dbTransformations.filter(item => !item.isSelf),
    ...DEFAULT_CLIENT_TRANSFORMATIONS
  ];

  const filteredClientItems = clientTransItems.filter(item => 
    filter === 'all' ? true : item.goal === filter
  );

  return (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
      
      {/* SECTION 1: Coach Self-Transformation Proof */}
      <section className="space-y-10">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-gold/10 border border-gold/20 text-gold rounded-full text-xs font-bold uppercase tracking-wider">
            <Star className="h-3 w-3 fill-gold" />
            <span>Coach Transformation Proof</span>
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mt-3 uppercase tracking-tight">
            MY SELF-TRANSFORMATION PROOF
          </h2>
          <p className="text-gray-400 mt-3 text-base">
            Walking the talk. Real changes require strict execution. Here is my personal journey from 60kg lean to 70kg full muscular development.
          </p>
        </div>

        {/* 3-Image Block with Object Contain to prevent any cutoff */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-card-border space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-center text-xs uppercase tracking-widest text-gray-500 font-bold">Before (60 kg)</p>
              <div className="relative bg-[#050507]/90 rounded-2xl border border-card-border p-2 overflow-hidden flex items-center justify-center">
                <img 
                  src={activeCoachTrans.beforeImg} 
                  alt="Before" 
                  className="h-[380px] sm:h-[450px] w-full object-contain rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-center text-xs uppercase tracking-widest text-gold font-bold">After (70 kg) - Front Flex</p>
              <div className="relative bg-[#050507]/90 rounded-2xl border border-gold/25 p-2 overflow-hidden flex items-center justify-center">
                <img 
                  src={activeCoachTrans.afterImg} 
                  alt="After Front" 
                  className="h-[380px] sm:h-[450px] w-full object-contain rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-center text-xs uppercase tracking-widest text-gold font-bold">After (70 kg) - Side Flex</p>
              <div className="relative bg-[#050507]/90 rounded-2xl border border-gold/25 p-2 overflow-hidden flex items-center justify-center">
                <img 
                  src={activeCoachTrans.afterImg2 || "http://127.0.0.1:8000/uploads/after_side_self.jpg"} 
                  alt="After Side" 
                  className="h-[380px] sm:h-[450px] w-full object-contain rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Details & Biography */}
          <div className="border-t border-card-border pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-4 grid grid-cols-3 gap-4 text-center border-r border-card-border/60 pr-6">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Before Weight</p>
                <p className="text-xl font-black text-white mt-1">{activeCoachTrans.beforeWeight}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">After Weight</p>
                <p className="text-xl font-black text-gold mt-1">{activeCoachTrans.afterWeight}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Duration</p>
                <p className="text-xl font-black text-white mt-1">{activeCoachTrans.duration}</p>
              </div>
            </div>
            <div className="lg:col-span-8 space-y-2.5">
              <div className="flex items-center space-x-2 text-gold">
                <Trophy className="h-4 w-4" />
                <span className="text-xs font-extrabold uppercase tracking-wider">{activeCoachTrans.name}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed italic">
                "{activeCoachTrans.story}"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Client Success Transformations */}
      <section className="space-y-10">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-gold/10 border border-gold/20 text-gold rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3 w-3" />
            <span>Client Success Gallery</span>
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mt-3 uppercase tracking-tight">
            MY CLIENTS' TRANSFORMATIONS
          </h2>
          <p className="text-gray-400 mt-3 text-base">
            Real physical shifts backed by customized science-based training logs and accurate calorie calculations.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center space-x-4">
          {['all', 'fat loss', 'muscle gain'].map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option as any)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold border capitalize transition-all duration-300 ${
                filter === option
                  ? 'bg-gold border-gold text-background shadow-[0_0_15px_var(--gold-glow)]'
                  : 'border-card-border text-gray-300 hover:border-gray-500 hover:text-white bg-transparent'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Grid List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Dumbbell className="h-10 w-10 text-gold animate-spin" />
          </div>
        ) : (
          <div className="space-y-16">
            {filteredClientItems.map((item) => (
              <div 
                key={item.id}
                className="glass-panel rounded-3xl border border-card-border p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Images Container using Contain styling to prevent cutoff */}
                <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-center text-xs uppercase tracking-widest text-gray-400 font-bold">Before</p>
                    <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden border border-card-border bg-[#050507] p-1 flex items-center justify-center">
                      <img src={item.beforeImg} alt="Before" className="h-full w-full object-contain rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-center text-xs uppercase tracking-widest text-gold font-bold">After</p>
                    <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden border border-gold/30 bg-[#050507] p-1 flex items-center justify-center">
                      <img src={item.afterImg} alt="After" className="h-full w-full object-contain rounded-xl" />
                    </div>
                  </div>
                </div>

                {/* Stories & Stats */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="flex items-center space-x-2 text-gold">
                    <Trophy className="h-5 w-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Success Record #{item.id}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">{item.name}</h3>
                    <p className="text-xs text-gray-400">Age: {item.age} | Goal: <span className="capitalize text-gold font-semibold">{item.goal}</span></p>
                  </div>

                  {/* Stats Block */}
                  <div className="grid grid-cols-3 gap-4 border-y border-card-border py-4 my-4">
                    <div>
                      <p className="text-xs text-gray-500">Before Weight</p>
                      <p className="text-lg font-bold text-white">{item.beforeWeight}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">After Weight</p>
                      <p className="text-lg font-bold text-gold">{item.afterWeight}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-lg font-bold text-white">{item.duration}</p>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed">{item.story}</p>

                  <div className="inline-flex items-center space-x-2 text-gold text-xs font-bold bg-gold/5 px-3.5 py-1.5 rounded-full border border-gold/10">
                    <Activity className="h-4 w-4" />
                    <span>Plan Used: {item.goal === 'fat loss' ? 'Elite Shred & Diet' : 'Aesthetic Hypertrophy'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
