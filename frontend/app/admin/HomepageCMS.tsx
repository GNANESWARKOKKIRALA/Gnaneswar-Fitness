'use client';

import { useState, useEffect } from 'react';
import { apiFetch, resolveMediaUrl } from '@/lib/api';
import { LayoutDashboard, Save, Edit, Eye, EyeOff, UploadCloud, Plus, X } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

interface HomepageSection {
  id?: number;
  section_id: string;
  title: string;
  subtitle: string;
  image_url: string;
  content: string;
  cta_text: string;
  cta_url: string;
  is_visible: boolean;
  display_order: number;
}

export default function HomepageCMS() {
  const { token } = useAuth();
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSections = async () => {
    try {
      const data = await apiFetch('/api/homepage');
      // Create defaults if empty
      if (data.length === 0) {
        setSections([
          { section_id: 'hero', title: '', subtitle: '', image_url: '', content: '', cta_text: 'Start Transformation', cta_url: '/login', is_visible: true, display_order: 1 },
          { section_id: 'about', title: 'Know More About Me', subtitle: '', image_url: '', content: '', cta_text: '', cta_url: '', is_visible: true, display_order: 2 },
          { section_id: 'services', title: 'Coaching Services', subtitle: '', image_url: '', content: '', cta_text: '', cta_url: '', is_visible: true, display_order: 3 },
          { section_id: 'cta', title: 'Ready to Build Your Best Physique?', subtitle: '', image_url: '', content: '', cta_text: 'Start Coaching', cta_url: '/login', is_visible: true, display_order: 4 }
        ]);
      } else {
        setSections(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleSave = async (section: HomepageSection) => {
    try {
      await apiFetch(`/api/homepage/${section.section_id}`, {
        method: 'PUT',
        body: JSON.stringify(section)
      }, token || undefined);
      
      setActionMessage({ type: 'success', text: `${section.section_id} section saved successfully!` });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to save section' });
    }
  };

  const updateSection = (idx: number, field: keyof HomepageSection, value: any) => {
    const updated = [...sections];
    updated[idx] = { ...updated[idx], [field]: value };
    setSections(updated);
  };

  if (loading) return <div className="text-gray-400 p-8 text-center animate-pulse">Loading CMS...</div>;

  return (
    <div className="space-y-6 fade-in max-w-6xl mx-auto pb-20">
      <div>
        <h2 className="text-3xl font-bold font-bebas tracking-wider text-white flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-[#00BFFF]" />
          Homepage Content CMS
        </h2>
        <p className="text-gray-400 mt-2">Update the text, titles, and visibility of homepage sections.</p>
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-xl border ${actionMessage.type === 'success' ? 'bg-[#00BFFF]/10 border-[#00BFFF]/30 text-[#00BFFF]' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
          {actionMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {sections.map((sec, idx) => (
          <div key={idx} className="bg-[#0B0F12] border border-[#1C2329] p-6 rounded-2xl relative group">
            
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#1C2329]">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold font-bebas text-[#00BFFF] uppercase tracking-wider">{sec.section_id} Section</span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => updateSection(idx, 'is_visible', !sec.is_visible)}
                  className={`flex items-center gap-2 text-sm font-bold ${sec.is_visible ? 'text-green-500' : 'text-gray-500'}`}
                >
                  {sec.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {sec.is_visible ? 'Visible' : 'Hidden'}
                </button>
                <button 
                  onClick={() => handleSave(sec)}
                  className="px-4 py-2 bg-[#111820] hover:bg-[#00BFFF] text-white hover:text-black rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-2 border border-[#333] hover:border-transparent"
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Title / Headline</label>
                  <input 
                    type="text"
                    className="w-full bg-[#050505] border border-[#1C2329] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00BFFF] transition-colors"
                    value={sec.title || ''} onChange={e => updateSection(idx, 'title', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subtitle</label>
                  <input 
                    type="text"
                    className="w-full bg-[#050505] border border-[#1C2329] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00BFFF] transition-colors"
                    value={sec.subtitle || ''} onChange={e => updateSection(idx, 'subtitle', e.target.value)}
                  />
                </div>
                {(sec.section_id === 'hero' || sec.section_id === 'cta') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CTA Button Text</label>
                      <input 
                        type="text"
                        className="w-full bg-[#050505] border border-[#1C2329] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00BFFF] transition-colors"
                        value={sec.cta_text || ''} onChange={e => updateSection(idx, 'cta_text', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CTA URL</label>
                      <input 
                        type="text"
                        className="w-full bg-[#050505] border border-[#1C2329] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00BFFF] transition-colors"
                        value={sec.cta_url || ''} onChange={e => updateSection(idx, 'cta_url', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Main Content</label>
                  <textarea 
                    rows={sec.section_id === 'about' ? 6 : 4}
                    className="w-full bg-[#050505] border border-[#1C2329] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00BFFF] transition-colors text-sm"
                    value={sec.content || ''} onChange={e => updateSection(idx, 'content', e.target.value)}
                  />
                </div>
                {(sec.section_id === 'hero' || sec.section_id === 'about') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Image URL (Optional)</label>
                    <input 
                      type="text" placeholder="/uploads/image.jpg"
                      className="w-full bg-[#050505] border border-[#1C2329] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00BFFF] transition-colors"
                      value={sec.image_url || ''} onChange={e => updateSection(idx, 'image_url', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
