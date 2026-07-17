'use client';

import { useState } from 'react';
import { Phone, MessageSquare, Mail, MapPin, ChevronDown, ChevronUp, Search, Send, Dumbbell } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const Instagram = (props: any) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

interface FAQ {
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    question: "Do I get a custom diet plan or templates?",
    answer: "You get fully custom diet plans and caloric templates. Once your payment is verified, you can access the AI Diet Planner inside your dashboard to generate or edit specific macronutrient meal setups based on your food preferences (e.g. Vegetarian, Non-Vegetarian, Vegan) and calorie goals."
  },
  {
    question: "What equipment do I need for the training programs?",
    answer: "Our Beginner and Intermediate workout programs are designed for a standard gym setup (barbells, dumbbells, cables, and basic machines). If you train at home, you can choose 'Dumbbells Only' or 'Bodyweight Only' inside the AI Workout Planner to generate tailored routines."
  },
  {
    question: "How long does it take for my order to get approved?",
    answer: "Payment screenshot verification is handled manually by our administrators. It typically takes between 30 minutes to 2 hours. You will receive an immediate update on your client dashboard once the status changes to approved."
  },
  {
    question: "Can I update my weight logs and check progress?",
    answer: "Yes! The dashboard includes a progress log where you can update your scale weight, tape measurements, and upload body assessment photos. This helps you track trends and allows the coach to make adjustments."
  }
];

export default function Contact() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredFaqs = FAQS.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFAQToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setSubmitting(true);
    setError(null);

    try {
      await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to submit contact message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-xs uppercase tracking-widest text-gold font-bold">Get In Touch</h1>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
          CONTACT & SUPPORT
        </h2>
        <p className="text-gray-400 mt-4 text-lg">
          Have questions about the programs, custom plans, or payment methods? Drop us a message.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24 items-start">
        {/* Contact Info & Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-8 rounded-3xl border border-card-border space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Direct Channels</h3>
            
            <a 
              href="tel:+916309764875" 
              className="flex items-center space-x-4 p-4 rounded-2xl bg-background/50 border border-card-border hover:border-gold/50 transition-colors"
            >
              <div className="h-10 w-10 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center text-gold">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Phone (Tap to Call)</p>
                <p className="text-white font-bold text-sm">+91 6309764875</p>
              </div>
            </a>

            <a 
              href="https://wa.me/916309764875" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center space-x-4 p-4 rounded-2xl bg-background/50 border border-card-border hover:border-gold/50 transition-colors"
            >
              <div className="h-10 w-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center text-green-500">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400">WhatsApp Chat</p>
                <p className="text-white font-bold text-sm">+91 6309764875</p>
              </div>
            </a>

            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-background/50 border border-card-border">
              <div className="h-10 w-10 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center text-gold">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Support Email</p>
                <p className="text-white font-bold text-sm">anjaniprasad176@gmail.com</p>
              </div>
            </div>

            <a 
              href="https://instagram.com/gnaneswar_bb"
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-4 p-4 rounded-2xl bg-background/50 border border-card-border hover:border-gold/50 transition-colors"
            >
              <div className="h-10 w-10 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center text-gold">
                <Instagram className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Instagram</p>
                <p className="text-white font-bold text-sm">@gnaneswar_bb</p>
              </div>
            </a>

            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-background/50 border border-card-border">
              <div className="h-10 w-10 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center text-gold">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Location</p>
                <p className="text-white font-bold text-sm">Hyderabad, Telangana, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-8 rounded-3xl border border-card-border">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="mx-auto h-12 w-12 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center text-gold">
                  <Send className="h-5 w-5 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white">Message Dispatched!</h3>
                <p className="text-gray-400 text-sm">Thank you for writing. We will get back to your email within 24 hours.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-gold border border-gold/20 hover:border-gold px-4 py-2 rounded-full transition-all"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-2">Send an Email</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe" 
                      className="w-full bg-background border border-card-border focus:border-gold/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400">Your Email</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com" 
                      className="w-full bg-background border border-card-border focus:border-gold/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400">Your Message</label>
                  <textarea 
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter details about your inquiry..."
                    className="w-full bg-background border border-card-border focus:border-gold/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-lg">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="gold-gradient-bg text-background font-bold px-8 py-3 rounded-full hover:scale-105 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{submitting ? 'Transmitting...' : 'Transmit Message'}</span>
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Accordion FAQ Section */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">Frequently Asked Questions</h3>
        
        {/* Search FAQ */}
        <div className="relative max-w-md mx-auto mb-10">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full bg-card-bg border border-card-border focus:border-gold/50 rounded-full px-5 py-3 pl-11 text-sm text-white focus:outline-none"
          />
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
        </div>

        {/* FAQs list */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <div 
                key={index}
                className="glass-panel border border-card-border rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => handleFAQToggle(index)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-white hover:text-gold transition-colors focus:outline-none"
                >
                  <span>{faq.question}</span>
                  {openIndex === index ? <ChevronUp className="h-5 w-5 text-gold" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                </button>
                {openIndex === index && (
                  <div className="px-5 pb-5 pt-1 text-sm text-gray-300 leading-relaxed border-t border-card-border/30 mt-1">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-400 text-sm">
              No matching FAQs found. Try searching for "diet", "workout", or "screenshot".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
