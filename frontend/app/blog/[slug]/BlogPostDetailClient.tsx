'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag, Dumbbell, Share2, BookOpen, Check } from 'lucide-react';
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

export default function BlogPostDetailClient({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const unwrappedParams = params instanceof Promise ? use(params) : params;
  const slug = unwrappedParams.slug;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchPost = async () => {
      try {
        const data = await apiFetch(`/api/blogs/${slug}`);
        setPost(data);
      } catch (err) {
        console.error('Error fetching blog post:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center bg-[#050505]">
        <Dumbbell className="h-10 w-10 text-[#00BFFF] animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-24 max-w-4xl mx-auto text-center space-y-6 bg-[#050505] text-[#FFFFFF]">
        <BookOpen className="h-16 w-16 text-[#00BFFF]/40 mx-auto" />
        <h1 className="text-4xl font-black font-display text-white uppercase">Blog Article Not Found</h1>
        <p className="text-[#8B949E] text-xs">The requested article could not be found or may have been unpublished.</p>
        <Link
          href="/blog"
          className="btn-primary inline-flex items-center space-x-2 text-xs font-extrabold px-6 py-3 shadow-lg"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Articles</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 bg-[#050505] text-[#FFFFFF]">
      {/* Navigation & Share */}
      <div className="flex items-center justify-between">
        <Link
          href="/blog"
          className="inline-flex items-center space-x-2 text-xs font-bold text-[#8B949E] hover:text-[#00BFFF] transition-colors bg-[#111820] px-4 py-2 rounded-full border border-[#1C2329]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Articles</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center space-x-2 text-xs font-extrabold text-[#00BFFF] bg-[#00BFFF]/10 hover:bg-[#00BFFF]/20 px-4 py-2 rounded-full border border-[#00BFFF]/30 transition-colors uppercase tracking-wider"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
          <span>{copied ? 'Link Copied!' : 'Share Article'}</span>
        </button>
      </div>

      {/* Header Info */}
      <div className="space-y-4">
        <div className="inline-block bg-[#00BFFF] text-[#050505] text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full font-display">
          {post.category || 'Bodybuilding'}
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-display text-white leading-tight uppercase">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center text-xs text-[#8B949E] gap-6 pt-2 border-b border-[#1C2329] pb-6">
          <span className="flex items-center space-x-2">
            <User className="h-4 w-4 text-[#00BFFF]" />
            <span className="text-white font-semibold">{post.author || 'Gnaneswar Kokkirala'}</span>
          </span>

          <span className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-[#00BFFF]" />
            <span>{new Date(post.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </span>

          {post.tags && (
            <span className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-[#00BFFF]" />
              <span>{post.tags.split(',').join(' • ')}</span>
            </span>
          )}
        </div>
      </div>

      {/* Featured Cover Image */}
      {post.cover_img && (
        <div className="relative h-80 sm:h-[450px] w-full rounded-3xl overflow-hidden border border-[#1C2329] bg-black shadow-2xl">
          <img
            src={resolveMediaUrl(post.cover_img)}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Blog Article Body */}
      <div className="card-classic p-8 sm:p-12 space-y-6 text-gray-200 text-sm leading-relaxed border border-[#1C2329]">
        {post.body.split('\n\n').map((paragraph, index) => {
          if (paragraph.startsWith('### ')) {
            return (
              <h3 key={index} className="text-2xl font-black font-display text-white mt-6 mb-2 cyan-gradient-text uppercase">
                {paragraph.replace('### ', '')}
              </h3>
            );
          }
          if (paragraph.startsWith('#### ')) {
            return (
              <h4 key={index} className="text-base font-extrabold text-[#00BFFF] mt-4 mb-1 uppercase">
                {paragraph.replace('#### ', '')}
              </h4>
            );
          }
          return (
            <p key={index} className="leading-relaxed text-[#E5E7EB]">
              {paragraph}
            </p>
          );
        })}
      </div>

      {/* Author Footer Card */}
      <div className="card-classic p-8 border border-[#00BFFF]/30 flex items-center space-x-6">
        <div className="h-16 w-16 rounded-2xl overflow-hidden border border-[#00BFFF]/40 flex-shrink-0 bg-black logo-shine">
          <img src="/coach.jpg" alt="Coach Gnaneswar" className="h-full w-full object-cover" />
        </div>
        <div className="space-y-1">
          <h4 className="text-base font-extrabold text-white">Written by {post.author || 'Gnaneswar Kokkirala'}</h4>
          <p className="text-xs text-[#00BFFF] font-extrabold uppercase tracking-wider font-display">Certified Strength & Conditioning Specialist</p>
          <p className="text-xs text-[#8B949E]">Head coach at Gnaneswar Fit. Passionate about natural hypertrophy science, progressive loading, and body composition optimization.</p>
        </div>
      </div>
    </div>
  );
}
