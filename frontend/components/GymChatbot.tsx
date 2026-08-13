'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Dumbbell, User, RefreshCw, MessageSquare } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "What coaching programs do you offer?",
  "How can I lose body fat while maintaining muscle?",
  "Who is Coach Gnaneswar?",
  "What is the recommended creatine daily dosage?",
  "How do client transformations work?"
];

export default function GymChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: "### Welcome to **Gnaneswar Fit AI Assistant**!\n\nI am your 24/7 fitness & bodybuilding coach. Ask me anything about:\n- **Custom Workout & Diet Plans**\n- **Client Transformations & Proof**\n- **Supplements, Recovery & Fat Loss**\n- **Joining Elite Coaching**",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      // Call public chat endpoint
      const res = await apiFetch('/api/ai/public-chat', {
        method: 'POST',
        body: JSON.stringify({
          message: query,
          history: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }))
        })
      });

      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.reply || res.plan || "I've processed your query. Let me know if you need specific exercise routines or nutrition guidance!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botReply]);
    } catch (err: any) {
      // Local fallback response
      let fallbackText = getLocalFallback(query);
      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botReply]);
    } finally {
      setLoading(false);
    }
  };

  const getLocalFallback = (msg: string): string => {
    const m = msg.toLowerCase();
    if (m.includes('program') || m.includes('pricing') || m.includes('cost') || m.includes('plan')) {
      return "### Gnaneswar Fit Elite Coaching Programs\n\nWe offer 3 primary science-based blueprints:\n1. **Beginner Strength Blueprint (₹999)**: Linear progression barbell fundamentals.\n2. **Aesthetic Muscle Builder (₹1,999)**: 4-day upper/lower hypertrophy split.\n3. **Ultimate Elite Shred & Diet (₹2,999)**: Combined training, macronutrient model, and weekly check-ins.\n\nVisit our [Pricing Page](/pricing) to lock in your slot!";
    }
    if (m.includes('who') || m.includes('gnaneswar') || m.includes('coach') || m.includes('about')) {
      return "### About Coach Gnaneswar Kokkirala\n\nGnaneswar Kokkirala is a Certified Strength & Conditioning Specialist with 4+ years of competitive bodybuilding coaching. He has transformed over 20+ clients using scientific progressive overload, macronutrient structuring, and bio-feedback tracking.";
    }
    if (m.includes('fat loss') || m.includes('shred') || m.includes('weight loss')) {
      return "### Science of Fat Loss\n\n1. **Caloric Deficit**: Eat 300-500 kcal below maintenance.\n2. **High Protein**: Maintain 1.8-2.2g of protein per kg of body weight to prevent muscle loss.\n3. **Progressive Resistance**: Continue lifting heavy to signal your body to keep lean tissue.\n4. **Cardio**: Moderate LISS (Low-Intensity Steady State) 3-4x a week.";
    }
    if (m.includes('creatine')) {
      return "### Creatine Monohydrate Protocol\n\n- **Dosage**: 3-5g daily. No loading phase required.\n- **Timing**: Anytime consistent daily. Post-workout with carbohydrates enhances absorption.\n- **Benefits**: Boosts ATP regeneration, muscle hydration, and strength output.";
    }
    if (m.includes('transformation')) {
      return "### Client Transformations\n\nAll client transformations are 100% verified with photo and video proof! Check out real client results on our [Transformations Page](/transformations).";
    }
    return "### Fitness AI Assistant\n\nTo build an aesthetic physique, consistency in progressive overload and macronutrient tracking is key. Ask me about exercises (chest, legs, back), diet plans, supplements, or coaching options!";
  };

  return (
    <>
      {/* Floating Chat Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-extrabold px-5 py-3.5 rounded-full shadow-[0_0_25px_rgba(229,169,60,0.5)] hover:scale-105 transition-all duration-300 group"
          >
            <div className="relative">
              <Bot className="h-6 w-6 text-black" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <span className="text-sm font-black tracking-wider uppercase">Gym AI Assistant</span>
          </button>
        )}
      </div>

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-[#0c0d12]/95 backdrop-blur-xl border border-gold/30 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-slide-up max-h-[80vh] sm:max-h-[620px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#141620] to-[#0c0d12] p-4 border-b border-card-border flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center space-x-1.5">
                  <span>Gnaneswar Fit AI</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </h3>
                <p className="text-[11px] text-gray-400">24/7 Bodybuilding & Diet Coach</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-card-bg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs sm:text-sm">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex space-x-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="h-7 w-7 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold flex-shrink-0 mt-1">
                    <Dumbbell className="h-3.5 w-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-gold text-black font-semibold rounded-br-none shadow-[0_0_15px_rgba(229,169,60,0.2)]'
                      : 'bg-[#161824] border border-card-border text-gray-200 rounded-bl-none leading-relaxed'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  <div
                    className={`text-[10px] mt-1.5 ${
                      m.sender === 'user' ? 'text-black/70 text-right' : 'text-gray-500'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>

                {m.sender === 'user' && (
                  <div className="h-7 w-7 rounded-full bg-gold/80 flex items-center justify-center text-black flex-shrink-0 mt-1">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex space-x-2 justify-start items-center">
                <div className="h-7 w-7 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold">
                  <Bot className="h-3.5 w-3.5 animate-spin" />
                </div>
                <div className="bg-[#161824] border border-card-border px-4 py-2.5 rounded-2xl text-gray-400 text-xs italic flex items-center space-x-2">
                  <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse" />
                  <span>Coach AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Pills */}
          <div className="px-4 py-2 bg-[#090a0f] border-t border-card-border/60 overflow-x-auto flex space-x-2 scrollbar-none">
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="whitespace-nowrap text-[11px] bg-card-bg hover:bg-gold/15 hover:border-gold/40 border border-card-border text-gray-300 hover:text-gold px-3 py-1 rounded-full transition-colors flex-shrink-0"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-[#11131c] border-t border-card-border flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Coach AI about workout, diet, programs..."
              className="flex-1 bg-[#090a0f] border border-card-border focus:border-gold rounded-full px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="h-10 w-10 rounded-full bg-gold text-black flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex-shrink-0 shadow-[0_0_10px_rgba(229,169,60,0.3)]"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
