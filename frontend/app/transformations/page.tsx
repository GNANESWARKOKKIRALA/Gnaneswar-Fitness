'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Trophy, Activity, Dumbbell, Star, Play, Video, Film } from 'lucide-react';
import { apiFetch, resolveMediaUrl } from '@/lib/api';

interface ClientTransformation {
  id: number;
  client_name: string;
  before_img: string;
  after_img: string;
  video_url?: string;
  story: string;
  duration?: string;
  before_weight?: string;
  after_weight?: string;
  goal?: string;
  is_published: boolean;
}

interface MyTransformation {
  id: number;
  title: string;
  story: string;
  before_img: string;
  after_img: string;
  after_img_2?: string;
  video_url?: string;
  duration?: string;
  before_weight?: string;
  after_weight?: string;
  category?: string;
  is_published: boolean;
}

interface TransformationVideo {
  id: number;
  title: string;
  description?: string;
  client_name?: string;
  thumbnail_url?: string;
  video_url: string;
  is_published: boolean;
}

export default function Transformations() {
  const [filter, setFilter] = useState<'all' | 'fat loss' | 'muscle gain'>('all');
  const [clientItems, setClientItems] = useState<ClientTransformation[]>([]);
  const [myItems, setMyItems] = useState<MyTransformation[]>([]);
  const [videoItems, setVideoItems] = useState<TransformationVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [cData, mData, vData] = await Promise.all([
          apiFetch('/api/client-transformations'),
          apiFetch('/api/my-transformations'),
          apiFetch('/api/transformation-videos')
        ]);
        setClientItems(cData || []);
        setMyItems(mData || []);
        setVideoItems(vData || []);
      } catch (err) {
        console.error('Error fetching transformations data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const activeSelfTrans = myItems.length > 0 ? myItems[0] : null;

  const filteredClientItems = clientItems.filter((item) =>
    filter === 'all' ? true : item.goal?.toLowerCase() === filter.toLowerCase()
  );

  return (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
      
      {/* SECTION 1: Coach Self-Transformation Proof */}
      {activeSelfTrans && (
        <section className="space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 bg-gold/10 border border-gold/25 text-gold rounded-full text-xs font-bold uppercase tracking-wider">
              <Star className="h-3.5 w-3.5 fill-gold" />
              <span>Coach Bodybuilding Proof</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              {activeSelfTrans.title || 'MY SELF-TRANSFORMATION PROOF'}
            </h2>
            <p className="text-gray-300 text-base leading-relaxed">
              Leading by example. Peak physical conditioning requires disciplined progressive overload and strict nutrition.
            </p>
          </div>

          <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-card-border space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-center text-xs uppercase tracking-widest text-gray-400 font-bold">
                  Before ({activeSelfTrans.before_weight || '60 kg'})
                </p>
                <div className="relative bg-[#050507] rounded-2xl border border-card-border p-2 overflow-hidden flex items-center justify-center h-[380px] sm:h-[450px]">
                  <img 
                    src={resolveMediaUrl(activeSelfTrans.before_img)} 
                    alt="Before" 
                    className="h-full w-full object-contain rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-center text-xs uppercase tracking-widest text-gold font-bold">
                  After ({activeSelfTrans.after_weight || '70 kg'}) - Front Flex
                </p>
                <div className="relative bg-[#050507] rounded-2xl border border-gold/30 p-2 overflow-hidden flex items-center justify-center h-[380px] sm:h-[450px]">
                  <img 
                    src={resolveMediaUrl(activeSelfTrans.after_img)} 
                    alt="After Front" 
                    className="h-full w-full object-contain rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-center text-xs uppercase tracking-widest text-gold font-bold">
                  After ({activeSelfTrans.after_weight || '70 kg'}) - Side Flex
                </p>
                <div className="relative bg-[#050507] rounded-2xl border border-gold/30 p-2 overflow-hidden flex items-center justify-center h-[380px] sm:h-[450px]">
                  <img 
                    src={resolveMediaUrl(activeSelfTrans.after_img_2 || activeSelfTrans.after_img)} 
                    alt="After Side" 
                    className="h-full w-full object-contain rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Details & Biography */}
            <div className="border-t border-card-border pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-4 grid grid-cols-3 gap-4 text-center border-r border-card-border/60 pr-6">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Before</p>
                  <p className="text-xl font-black text-white mt-1">{activeSelfTrans.before_weight || '60 kg'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">After</p>
                  <p className="text-xl font-black text-gold mt-1">{activeSelfTrans.after_weight || '70 kg'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Duration</p>
                  <p className="text-xl font-black text-white mt-1">{activeSelfTrans.duration || '24 Weeks'}</p>
                </div>
              </div>
              <div className="lg:col-span-8 space-y-2.5">
                <div className="flex items-center space-x-2 text-gold">
                  <Trophy className="h-4 w-4" />
                  <span className="text-xs font-extrabold uppercase tracking-wider">Coach Gnaneswar Kokkirala</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed italic">
                  "{activeSelfTrans.story}"
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 2: Transformation Videos Showcase */}
      {videoItems.length > 0 && (
        <section className="space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 bg-gold/10 border border-gold/25 text-gold rounded-full text-xs font-bold uppercase tracking-wider">
              <Film className="h-3.5 w-3.5" />
              <span>Video Proof Showcase</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              TRANSFORMATION VIDEOS
            </h2>
            <p className="text-gray-300 text-base">
              Watch real client transformations, workout form executions, and physical shifts in action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videoItems.map((video) => (
              <div key={video.id} className="glass-panel rounded-3xl border border-card-border overflow-hidden flex flex-col space-y-4 p-4">
                <div className="relative h-56 rounded-2xl overflow-hidden bg-black flex items-center justify-center group">
                  {video.thumbnail_url ? (
                    <img src={resolveMediaUrl(video.thumbnail_url)} alt={video.title} className="h-full w-full object-cover opacity-80" />
                  ) : (
                    <div className="h-full w-full bg-[#12141d] flex items-center justify-center">
                      <Video className="h-12 w-12 text-gold/50" />
                    </div>
                  )}

                  <button
                    onClick={() => setActiveVideoUrl(resolveMediaUrl(video.video_url))}
                    className="absolute inset-0 m-auto h-14 w-14 rounded-full bg-gold/90 text-black flex items-center justify-center shadow-[0_0_20px_rgba(229,169,60,0.5)] group-hover:scale-110 transition-transform"
                  >
                    <Play className="h-6 w-6 fill-black ml-1" />
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gold tracking-wider">
                    {video.client_name ? `Client: ${video.client_name}` : 'Gnaneswar Fit'}
                  </span>
                  <h4 className="text-base font-extrabold text-white">{video.title}</h4>
                  {video.description && <p className="text-xs text-gray-400 line-clamp-2">{video.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: Client Transformations Gallery */}
      <section className="space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 bg-gold/10 border border-gold/25 text-gold rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Client Results Gallery</span>
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            CLIENT TRANSFORMATIONS
          </h2>
          <p className="text-gray-300 text-base">
            Verified physical shifts produced through custom training split design and structured calorie counters.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center space-x-4">
          {['all', 'fat loss', 'muscle gain'].map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option as any)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold border capitalize transition-all duration-300 ${
                filter === option
                  ? 'bg-gold border-gold text-black shadow-[0_0_15px_rgba(229,169,60,0.3)]'
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
        ) : filteredClientItems.length === 0 ? (
          <div className="glass-panel p-16 text-center rounded-3xl border border-card-border space-y-4">
            <Trophy className="h-12 w-12 text-gold/40 mx-auto" />
            <h3 className="text-xl font-bold text-white">No Client Transformations Yet</h3>
            <p className="text-gray-400 text-sm">New client results will appear here as soon as they are published from the Admin Portal.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {filteredClientItems.map((item) => (
              <div 
                key={item.id}
                className="glass-panel rounded-3xl border border-card-border p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Images Container */}
                <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-center text-xs uppercase tracking-widest text-gray-400 font-bold">Before</p>
                    <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden border border-card-border bg-[#050507] p-1 flex items-center justify-center">
                      <img src={resolveMediaUrl(item.before_img)} alt="Before" className="h-full w-full object-contain rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-center text-xs uppercase tracking-widest text-gold font-bold">After</p>
                    <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden border border-gold/30 bg-[#050507] p-1 flex items-center justify-center">
                      <img src={resolveMediaUrl(item.after_img)} alt="After" className="h-full w-full object-contain rounded-xl" />
                    </div>
                  </div>
                </div>

                {/* Stories & Stats */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="flex items-center space-x-2 text-gold">
                    <Trophy className="h-5 w-5" />
                    <span className="text-xs font-extrabold uppercase tracking-wider">Transformation Proof #{item.id}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">{item.client_name}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Goal: <span className="capitalize text-gold font-bold">{item.goal || 'fat loss'}</span>
                    </p>
                  </div>

                  {/* Stats Block */}
                  <div className="grid grid-cols-3 gap-4 border-y border-card-border py-4 my-4">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Before</p>
                      <p className="text-lg font-black text-white">{item.before_weight || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">After</p>
                      <p className="text-lg font-black text-gold">{item.after_weight || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Duration</p>
                      <p className="text-lg font-black text-white">{item.duration || '12 Weeks'}</p>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed">{item.story}</p>

                  {item.video_url && (
                    <button
                      onClick={() => setActiveVideoUrl(resolveMediaUrl(item.video_url))}
                      className="inline-flex items-center space-x-2 text-xs font-bold text-black gold-gradient-bg px-4 py-2 rounded-full shadow-md hover:scale-105 transition-transform"
                    >
                      <Play className="h-3.5 w-3.5 fill-black" />
                      <span>Watch Transformation Video</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Video Modal Player */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-[#0c0d12] rounded-3xl border border-gold/40 p-4 shadow-2xl space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-extrabold text-gold uppercase tracking-wider flex items-center space-x-2">
                <Video className="h-4 w-4" />
                <span>Transformation Video Player</span>
              </span>
              <button
                onClick={() => setActiveVideoUrl(null)}
                className="text-gray-400 hover:text-white text-sm font-bold bg-card-bg px-3 py-1 rounded-full border border-card-border"
              >
                Close (✕)
              </button>
            </div>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
              <video src={activeVideoUrl} controls autoPlay className="h-full w-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
