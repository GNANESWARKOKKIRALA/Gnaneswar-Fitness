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
      <div className="min-h-[70vh] flex justify-center items-center">
        <Dumbbell className="h-10 w-10 text-gold animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-24 max-w-4xl mx-auto text-center space-y-6">
        <BookOpen className="h-16 w-16 text-gold/40 mx-auto" />
        <h1 className="text-3xl font-extrabold text-white">Blog Article Not Found</h1>
        <p className="text-gray-400">The requested article could not be found or may have been unpublished.</p>
        <Link
          href="/blog"
          className="inline-flex items-center space-x-2 text-sm font-bold text-black gold-gradient-bg px-6 py-3 rounded-full shadow-[0_0_15px_rgba(229,169,60,0.3)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Articles</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Navigation & Share */}
      <div className="flex items-center justify-between">
        <Link
          href="/blog"
          className="inline-flex items-center space-x-2 text-xs font-bold text-gray-300 hover:text-gold transition-colors bg-card-bg px-4 py-2 rounded-full border border-card-border"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Articles</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center space-x-2 text-xs font-bold text-gold bg-gold/10 hover:bg-gold/20 px-4 py-2 rounded-full border border-gold/30 transition-colors"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
          <span>{copied ? 'Link Copied!' : 'Share Article'}</span>
        </button>
      </div>

      {/* Header Info */}
      <div className="space-y-4">
        <div className="inline-block bg-gold text-black text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full">
          {post.category || 'Bodybuilding'}
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center text-xs text-gray-400 gap-6 pt-2 border-b border-card-border/80 pb-6">
          <span className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gold" />
            <span className="text-white font-semibold">{post.author || 'Gnaneswar Kokkirala'}</span>
          </span>

          <span className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gold" />
            <span>{new Date(post.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </span>

          {post.tags && (
            <span className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-gold" />
              <span>{post.tags.split(',').join(' • ')}</span>
            </span>
          )}
        </div>
      </div>

      {/* Featured Cover Image */}
      {post.cover_img && (
        <div className="relative h-80 sm:h-[450px] w-full rounded-3xl overflow-hidden border border-card-border bg-[#050507] shadow-2xl">
          <img
            src={resolveMediaUrl(post.cover_img)}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Blog Article Body */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-card-border space-y-6 text-gray-200 text-base leading-relaxed">
        {post.body.split('\n\n').map((paragraph, index) => {
          if (paragraph.startsWith('### ')) {
            return (
              <h3 key={index} className="text-2xl font-black text-white mt-6 mb-2 gold-gradient-text uppercase">
                {paragraph.replace('### ', '')}
              </h3>
            );
          }
          if (paragraph.startsWith('#### ')) {
            return (
              <h4 key={index} className="text-lg font-bold text-gold mt-4 mb-1">
                {paragraph.replace('#### ', '')}
              </h4>
            );
          }
          return (
            <p key={index} className="leading-relaxed">
              {paragraph}
            </p>
          );
        })}
      </div>

      {/* Author Footer Card */}
      <div className="glass-panel p-8 rounded-3xl border border-gold/30 flex items-center space-x-6">
        <div className="h-16 w-16 rounded-2xl overflow-hidden border border-gold/40 flex-shrink-0 bg-[#050507]">
          <img src="/coach.jpg" alt="Coach Gnaneswar" className="h-full w-full object-cover" />
        </div>
        <div className="space-y-1">
          <h4 className="text-lg font-extrabold text-white">Written by {post.author || 'Gnaneswar Kokkirala'}</h4>
          <p className="text-xs text-gold font-semibold uppercase tracking-wider">Certified Strength & Conditioning Specialist</p>
          <p className="text-xs text-gray-400">Head coach at Gnaneswar Fit. Passionate about natural hypertrophy science, progressive loading, and body composition optimization.</p>
        </div>
      </div>
    </div>
  );
}
