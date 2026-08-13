'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Calendar, User, Tag, BookOpen, ArrowRight, Dumbbell, Sparkles } from 'lucide-react';
import { apiFetch, resolveMediaUrl } from '@/lib/api';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  body: string;
  cover_img?: string;
  category?: string;
  tags?: string;
  author?: string;
  published_at: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Training', 'Nutrition', 'Bodybuilding', 'Supplements', 'Recovery'];

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      let query = `/api/blogs?search=${encodeURIComponent(search)}`;
      if (selectedCategory !== 'All') {
        query += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      const data = await apiFetch(query);
      setPosts(data);
    } catch (err) {
      console.error('Error loading blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [search, selectedCategory]);

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center space-x-2 px-3.5 py-1 bg-gold/10 border border-gold/25 text-gold rounded-full text-xs font-extrabold uppercase tracking-wider">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Scientific Bodybuilding Insights</span>
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tight">
          THE FITNESS <span className="gold-gradient-text">BLUEPRINT BLOG</span>
        </h1>
        <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
          Evidence-backed articles on progressive overload, macronutrient modeling, contest preparation, and natural bodybuilding.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-card-border flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles, keywords, tags..."
            className="w-full bg-[#090a0f] border border-card-border focus:border-gold rounded-full pl-12 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 justify-center w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-gold text-black shadow-[0_0_15px_rgba(229,169,60,0.3)]'
                  : 'border border-card-border text-gray-300 hover:border-gray-500 hover:text-white bg-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Cards Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Dumbbell className="h-10 w-10 text-gold animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-3xl border border-card-border space-y-4">
          <BookOpen className="h-12 w-12 text-gold/40 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Blog Posts Found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your search terms or selecting a different category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="glass-panel rounded-3xl border border-card-border overflow-hidden flex flex-col hover:border-gold/50 transition-all duration-300 group hover:-translate-y-1 shadow-lg"
            >
              {/* Cover Image */}
              <div className="relative h-56 w-full bg-[#050507] overflow-hidden">
                <img
                  src={resolveMediaUrl(post.cover_img) || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80"}
                  alt={post.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-gold text-black font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  {post.category || 'Bodybuilding'}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center text-xs text-gray-400 space-x-4">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5 text-gold" />
                      <span>{new Date(post.published_at).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <User className="h-3.5 w-3.5 text-gold" />
                      <span>{post.author || 'Gnaneswar Kokkirala'}</span>
                    </span>
                  </div>

                  <h2 className="text-xl font-extrabold text-white group-hover:text-gold transition-colors line-clamp-2">
                    {post.title}
                  </h2>

                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                    {post.body.replace(/[#*`_]/g, '')}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-4 border-t border-card-border/60 flex items-center justify-between">
                  <span className="text-xs text-gold/80 font-semibold flex items-center space-x-1">
                    <Tag className="h-3 w-3" />
                    <span>{post.tags ? post.tags.split(',')[0] : 'Fitness'}</span>
                  </span>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-gold hover:text-white transition-colors"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
