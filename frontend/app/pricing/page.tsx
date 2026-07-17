'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { QrCode, UploadCloud, CheckCircle, HelpCircle, ArrowRight, Dumbbell, MessageSquare } from 'lucide-react';

interface Program {
  id: number;
  title: string;
  price: number;
  type: string;
}

const FALLBACK_PROGRAMS: Program[] = [
  { id: 1, title: "Beginner Strength Blueprint", price: 999, type: "workout" },
  { id: 2, title: "Aesthetic Muscle Builder (Hypertrophy)", price: 1999, type: "workout" },
  { id: 3, title: "Ultimate Elite Shred & Diet Plan", price: 2999, type: "both" }
];

function PricingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, token } = useAuth();
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number>(1);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPrograms() {
      try {
        const data = await apiFetch('/api/programs');
        const list = data.length > 0 ? data : FALLBACK_PROGRAMS;
        setPrograms(list);
        
        // Check query param
        const selectParam = searchParams.get('select');
        if (selectParam) {
          const progId = parseInt(selectParam);
          setSelectedProgramId(progId);
        } else {
          setSelectedProgramId(list[0].id);
        }
      } catch (err) {
        setPrograms(FALLBACK_PROGRAMS);
        setSelectedProgramId(FALLBACK_PROGRAMS[0].id);
      }
    }
    loadPrograms();
  }, [searchParams]);

  useEffect(() => {
    const selected = programs.find(p => p.id === selectedProgramId);
    setSelectedProgram(selected || null);
  }, [selectedProgramId, programs]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login?redirect=pricing');
      return;
    }

    if (!selectedProgram || !screenshot) {
      setError("Please select a program and upload your payment screenshot.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('plan_id', selectedProgram.id.toString());
    formData.append('amount', selectedProgram.price.toString());
    formData.append('screenshot', screenshot);

    try {
      await apiFetch('/api/orders', {
        method: 'POST',
        body: formData,
      }, token || undefined);
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit order.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpiClick = (e: React.MouseEvent, type: 'phonepe' | 'gpay') => {
    e.preventDefault();
    if (!selectedProgram) return;
    
    const upiId = type === 'phonepe' ? "6309764875@ybl" : "6309764875@okaxis";
    const name = encodeURIComponent("Gnaneswar Kokkirala");
    const amount = selectedProgram.price;
    const link = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;
    
    window.location.href = link;
    
    setTimeout(() => {
      alert(`If your UPI app did not open automatically (especially on desktop), please transfer ₹${amount} to +91 6309764875 via PhonePe/GPay, and upload the transaction screenshot here.`);
    }, 1200);
  };

  return (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-xs uppercase tracking-widest text-gold font-bold">Secure Purchase</h1>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
          PLANS & CHECKOUT
        </h2>
        <p className="text-gray-400 mt-4 text-lg">
          Complete payment via UPI, upload your proof of transfer, and unlock access within hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Comparison & Selection Column */}
        <div className="lg:col-span-7 space-y-8">
          <div className="glass-panel p-8 rounded-3xl border border-card-border">
            <h3 className="text-xl font-bold text-white mb-6">1. Select Your Coaching Plan</h3>
            
            <div className="space-y-4">
              {programs.map((program) => (
                <label 
                  key={program.id}
                  onClick={() => setSelectedProgramId(program.id)}
                  className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedProgramId === program.id 
                      ? 'border-gold bg-gold/5 shadow-[0_0_15px_var(--gold-glow)]' 
                      : 'border-card-border hover:border-gray-700 bg-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <input 
                      type="radio" 
                      name="program" 
                      checked={selectedProgramId === program.id}
                      onChange={() => {}}
                      className="accent-gold h-4 w-4"
                    />
                    <div>
                      <p className="font-bold text-white">{program.title}</p>
                      <p className="text-xs text-gray-400 capitalize">{program.type} program</p>
                    </div>
                  </div>
                  <span className="text-xl font-extrabold text-white">₹{program.price}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pricing FAQ or Guarantee */}
          <div className="glass-panel p-8 rounded-3xl border border-card-border space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-gold" />
              <span>How does verification work?</span>
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Once you submit your transfer screenshot, our back-office team checks the transaction references in our bank logs. Once matches are verified (usually under 2 hours), your client dashboard unlocks the selected program PDF downloaders, workout builders, and nutritional planning.
            </p>
          </div>
        </div>

        {/* UPI Checkout & Screenshot Upload Column */}
        <div className="lg:col-span-5">
          {success ? (
            <div className="glass-panel p-8 rounded-3xl border border-card-border text-center space-y-6">
              <CheckCircle className="h-16 w-16 text-gold mx-auto animate-bounce" />
              <h3 className="text-2xl font-bold text-white">Screenshot Received!</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Thank you! Your transaction screenshot was uploaded successfully. The coaching team is reviewing the transaction details.
              </p>
              
              <div className="pt-2">
                <a 
                  href={`https://wa.me/916309764875?text=Hello%20Coach%20Gnaneswar,%20I%20have%20uploaded%20my%20payment%20screenshot%20for%20order.`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-full transition-all duration-300 shadow-md"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Send Screenshot on WhatsApp</span>
                </a>
              </div>

              <p className="text-gray-400 text-xs mt-2">
                You can track the state of your order under 'Payment Status' in your dashboard.
              </p>
              <button 
                onClick={() => router.push('/dashboard')}
                className="w-full bg-transparent border border-card-border hover:border-gold text-white hover:text-gold font-bold py-3 rounded-full transition-all duration-300"
              >
                Go to My Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitPayment} className="glass-panel p-8 rounded-3xl border border-card-border space-y-6">
              <h3 className="text-xl font-bold text-white">2. Complete UPI Payment</h3>

              {/* Mock QR Code UI */}
              <div className="bg-white p-6 rounded-2xl max-w-[220px] mx-auto shadow-inner flex flex-col items-center">
                {/* Simulated QR Code via CSS grid */}
                <div className="grid grid-cols-5 gap-1.5 w-36 h-36 border border-gray-200 p-2">
                  <div className="bg-black w-full h-full rounded"></div>
                  <div className="bg-black w-full h-full rounded"></div>
                  <div className="bg-transparent w-full h-full"></div>
                  <div className="bg-black w-full h-full rounded"></div>
                  <div className="bg-black w-full h-full rounded"></div>
                  <div className="bg-black w-full h-full rounded"></div>
                  <div className="bg-transparent w-full h-full"></div>
                  <div className="bg-black w-full h-full rounded"></div>
                  <div className="bg-transparent w-full h-full"></div>
                  <div className="bg-black w-full h-full rounded"></div>
                  <div className="bg-transparent w-full h-full"></div>
                  <div className="bg-black w-full h-full rounded"></div>
                  <div className="bg-black w-full h-full rounded"></div>
                  <div className="bg-black w-full h-full rounded"></div>
                  <div className="bg-transparent w-full h-full"></div>
                  <div className="bg-black w-full h-full rounded"></div>
                  <div className="bg-transparent w-full h-full"></div>
                  <div className="bg-black w-full h-full rounded"></div>
                  <div className="bg-transparent w-full h-full"></div>
                  <div className="bg-black w-full h-full rounded"></div>
                  <div className="bg-black w-full h-full rounded"></div>
                  <div className="bg-black w-full h-full rounded"></div>
                  <div className="bg-transparent w-full h-full"></div>
                  <div className="bg-black w-full h-full rounded"></div>
                  <div className="bg-black w-full h-full rounded"></div>
                </div>
                <p className="text-background text-[10px] uppercase font-bold tracking-wider mt-4">Scan QR code to Pay</p>
              </div>

              {/* Mobile UPI launchers */}
              {selectedProgram && (
                <div className="space-y-2 pt-2">
                  <button 
                    type="button"
                    onClick={(e) => handleUpiClick(e, 'phonepe')}
                    className="w-full flex items-center justify-center space-x-2 bg-[#5f259f] hover:bg-[#4f1f83] text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-sm"
                  >
                    <span>Pay via PhonePe</span>
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => handleUpiClick(e, 'gpay')}
                    className="w-full flex items-center justify-center space-x-2 bg-[#4285F4] hover:bg-[#357ae8] text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-sm"
                  >
                    <span>Pay via Google Pay</span>
                  </button>
                </div>
              )}

              {/* PhonePe/GPay Phone Number */}
              <div className="text-center bg-black/40 border border-card-border p-4 rounded-xl space-y-1">
                <p className="text-gray-400 text-xs font-semibold">PhonePe / GPay Mobile Number</p>
                <p className="text-gold font-black text-xl select-all">+91 6309764875</p>
                <p className="text-[10px] text-gray-500">Or use UPI ID: <span className="select-all font-mono">6309764875@ybl</span></p>
              </div>

              {/* Program Preview */}
              {selectedProgram && (
                <div className="border-y border-card-border py-4 flex justify-between items-center text-sm">
                  <span className="text-gray-400">Total Price:</span>
                  <span className="text-white font-extrabold text-lg">₹{selectedProgram.price}</span>
                </div>
              )}

              {/* Screenshot File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300 block">3. Upload Transfer Screenshot</label>
                
                <div className="relative border-2 border-dashed border-card-border hover:border-gold/50 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 bg-background/50">
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {screenshotPreview ? (
                    <div className="space-y-2">
                      <img 
                        src={screenshotPreview} 
                        alt="Screenshot Preview" 
                        className="h-28 mx-auto object-cover rounded-lg border border-card-border"
                      />
                      <p className="text-xs text-gold font-semibold truncate">{screenshot?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-gray-400">
                      <UploadCloud className="h-8 w-8 mx-auto text-gold/60" />
                      <p className="text-xs">Drag and drop or click to select image</p>
                      <p className="text-[10px] text-gray-500">Supports PNG, JPG, JPEG (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-lg">{error}</p>
              )}

              {/* Checkout Button */}
              {user ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full gold-gradient-bg text-background font-bold py-3.5 rounded-full hover:scale-102 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <span>{submitting ? 'Uploading Proof...' : 'Submit Payment Proof'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push(`/login?redirect=pricing?select=${selectedProgramId}`)}
                  className="w-full bg-transparent border border-gold text-gold hover:bg-gold hover:text-background font-bold py-3.5 rounded-full transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Log In to Purchase</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Pricing() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-40">
        <Dumbbell className="h-12 w-12 text-gold animate-spin" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
