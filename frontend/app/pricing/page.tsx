'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { QrCode, UploadCloud, CheckCircle, HelpCircle, ArrowRight, Dumbbell, MessageSquare, Sparkles, Printer, Zap } from 'lucide-react';

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

  // Gateway simulation states
  const [simulationStatus, setSimulationStatus] = useState<'idle' | 'processing' | 'success' | 'failed' | 'timeout'>('idle');
  const [simulationMessage, setSimulationMessage] = useState<string | null>(null);
  const [simulatedTxnId, setSimulatedTxnId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPrograms() {
      try {
        const data = await apiFetch('/api/programs');
        const list = data.length > 0 ? data : FALLBACK_PROGRAMS;
        setPrograms(list);
        
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

  const handleSimulatePayment = async (status: 'success' | 'failed' | 'timeout') => {
    if (!user) {
      router.push('/login?redirect=pricing');
      return;
    }
    if (!selectedProgram) {
      setError("Please select a program first.");
      return;
    }

    setSimulationStatus('processing');
    setSimulationMessage("Establishing secure connection to UPI Gateway...");
    setError(null);

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (status === 'timeout') {
      setSimulationStatus('timeout');
      setSimulationMessage("Transaction timed out. Google Pay/PhonePe PSP servers did not respond. (Code: 504)");
      setError("Simulated Gateway Timeout: Server did not respond.");
      return;
    }

    if (status === 'failed') {
      setSimulationStatus('failed');
      setSimulationMessage("Transaction declined by customer's bank. (Code: 402)");
      setError("Simulated Gateway Error: Transaction declined by bank.");
      return;
    }

    setSimulationMessage("UPI payment settled successfully! Finalizing membership tables...");
    const formData = new FormData();
    formData.append('plan_id', selectedProgram.id.toString());
    formData.append('amount', selectedProgram.price.toString());

    try {
      await apiFetch('/api/orders/simulate-success', {
        method: 'POST',
        body: formData,
      }, token || undefined);
      
      const txnId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
      setSimulatedTxnId(txnId);
      setSimulationStatus('success');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to process simulated success.");
      setSimulationStatus('failed');
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
      alert(`If your UPI app did not open automatically, please transfer ₹${amount} to +91 6309764875 via PhonePe/GPay, and upload the transaction screenshot here.`);
    }, 1200);
  };

  return (
    <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#050505] text-[#FFFFFF] space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#00BFFF] font-display">Secure Purchase</span>
        <h1 className="text-4xl sm:text-6xl font-black font-display text-white uppercase">
          PLANS & <span className="cyan-gradient-text">CHECKOUT</span>
        </h1>
        <p className="text-[#8B949E] text-sm sm:text-base leading-relaxed">
          Complete payment via UPI, upload your proof of transfer, and unlock access within hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Comparison & Selection Column */}
        <div className="lg:col-span-7 space-y-8">
          <div className="card-classic p-8 space-y-6">
            <h3 className="text-xl font-black font-display text-white">1. Select Your Coaching Plan</h3>
            
            <div className="space-y-4">
              {programs.map((program) => (
                <label 
                  key={program.id}
                  onClick={() => setSelectedProgramId(program.id)}
                  className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    selectedProgramId === program.id 
                      ? 'border-[#00BFFF] bg-[#00BFFF]/10 shadow-[0_0_15px_rgba(0,191,255,0.2)]' 
                      : 'border-[#1C2329] hover:border-gray-600 bg-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <input 
                      type="radio" 
                      name="program" 
                      checked={selectedProgramId === program.id}
                      onChange={() => {}}
                      className="accent-[#00BFFF] h-4 w-4"
                    />
                    <div>
                      <p className="font-bold text-white text-sm">{program.title}</p>
                      <p className="text-xs text-[#8B949E] capitalize">{program.type} program</p>
                    </div>
                  </div>
                  <span className="text-xl font-black font-display text-white">₹{program.price}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card-classic p-8 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-[#00BFFF]" />
              <span>How does verification work?</span>
            </h3>
            <p className="text-xs text-[#8B949E] leading-relaxed">
              Once you submit your transfer screenshot, our back-office team checks the transaction references in our bank logs. Once matches are verified (usually under 2 hours), your client dashboard unlocks the selected program PDF downloaders and workout builders.
            </p>
          </div>
        </div>

        {/* UPI Checkout & Screenshot Upload Column */}
        <div className="lg:col-span-5">
          {success ? (
            <div className="card-classic p-8 text-center space-y-6">
              <CheckCircle className="h-16 w-16 text-[#00BFFF] mx-auto animate-bounce" />
              
              {simulationStatus === 'success' ? (
                <div className="space-y-6 text-left">
                  <div className="text-center">
                    <h3 className="text-2xl font-black font-display text-white">Payment Verified!</h3>
                    <p className="text-xs text-[#00BFFF] font-extrabold mt-1 uppercase tracking-wider">Status: License Issued</p>
                  </div>
                  
                  <div className="bg-[#050505] border border-[#1C2329] rounded-2xl p-6 space-y-4 text-xs relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-[#00BFFF]/10 border-b border-l border-[#1C2329] text-[9px] text-[#00BFFF] font-extrabold uppercase px-3 py-1 font-display">
                      Official Receipt
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[10px] text-[#8B949E] uppercase tracking-widest">Client Email</p>
                      <p className="font-semibold text-white">{user?.email}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-[#8B949E] uppercase tracking-widest">Program</p>
                        <p className="font-semibold text-white">{selectedProgram?.title}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#8B949E] uppercase tracking-widest">Provider</p>
                        <p className="font-semibold text-white">UPI Gateway</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-[#8B949E] uppercase tracking-widest">Transaction ID</p>
                        <p className="font-mono text-xs text-[#00BFFF] font-semibold uppercase">{simulatedTxnId || 'TXN-SIMULATED'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#8B949E] uppercase tracking-widest">Date & Time</p>
                        <p className="font-semibold text-white text-xs">{new Date().toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="border-t border-[#1C2329] pt-4 flex justify-between items-center">
                      <span className="font-bold text-white">Amount Settled:</span>
                      <span className="text-[#00BFFF] font-black text-xl font-display">₹{selectedProgram?.price}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => window.print()}
                      className="flex-1 btn-secondary py-3 text-xs font-extrabold flex items-center justify-center space-x-2"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Print Receipt</span>
                    </button>
                    <button 
                      onClick={() => router.push('/dashboard')}
                      className="flex-1 btn-primary py-3 text-xs font-extrabold flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-black font-display text-white">Screenshot Received!</h3>
                  <p className="text-[#8B949E] text-xs leading-relaxed">
                    Thank you! Your transaction screenshot was uploaded successfully. The coaching team is reviewing the transaction details.
                  </p>
                  
                  <div className="pt-2">
                    <a 
                      href={`https://wa.me/916309764875?text=Hello%20Coach%20Gnaneswar,%20I%20have%20uploaded%20my%20payment%20screenshot%20for%20order.`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-full transition-all text-xs"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Send Screenshot on WhatsApp</span>
                    </a>
                  </div>

                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="w-full btn-secondary py-3 text-xs font-extrabold mt-4"
                  >
                    Go to My Dashboard
                  </button>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitPayment} className="card-classic p-8 space-y-6">
              <h3 className="text-xl font-black font-display text-white">2. Complete UPI Payment</h3>

              {/* PhonePe / GPay Details */}
              <div className="text-center bg-[#050505] border border-[#1C2329] p-4 rounded-xl space-y-1">
                <p className="text-[#8B949E] text-xs font-semibold">PhonePe / GPay Mobile Number</p>
                <p className="text-[#00BFFF] font-black text-xl font-display select-all">+91 6309764875</p>
                <p className="text-[10px] text-gray-400">Or use UPI ID: <span className="select-all font-mono text-white">6309764875@ybl</span></p>
              </div>

              {selectedProgram && (
                <div className="border-y border-[#1C2329] py-4 flex justify-between items-center text-xs">
                  <span className="text-[#8B949E]">Total Price:</span>
                  <span className="text-white font-black font-display text-2xl">₹{selectedProgram.price}</span>
                </div>
              )}

              {/* GATEWAY SIMULATOR TRAY */}
              {selectedProgram && (
                <div className="border border-[#00BFFF]/30 bg-[#00BFFF]/5 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-[#00BFFF] animate-pulse" />
                    <span className="text-xs font-extrabold text-[#00BFFF] uppercase tracking-widest font-display">Gateway Simulator</span>
                  </div>
                  
                  {simulationStatus === 'processing' ? (
                    <div className="flex flex-col items-center py-2 space-y-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00BFFF]"></div>
                      <p className="text-[10px] text-[#00BFFF] font-semibold animate-pulse">{simulationMessage}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSimulatePayment('success')}
                        className="bg-emerald-500/20 border border-emerald-500/50 hover:bg-emerald-500/40 text-emerald-400 text-[10px] font-bold py-2 rounded-xl transition-all"
                      >
                        Simulate Success
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulatePayment('failed')}
                        className="bg-red-500/20 border border-red-500/50 hover:bg-red-500/40 text-red-400 text-[10px] font-bold py-2 rounded-xl transition-all"
                      >
                        Simulate Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulatePayment('timeout')}
                        className="bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/40 text-amber-400 text-[10px] font-bold py-2 rounded-xl transition-all"
                      >
                        Simulate Timeout
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Screenshot File Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 block">3. Upload Screenshot Proof</label>
                
                <div className="relative border border-dashed border-[#1C2329] hover:border-[#00BFFF] rounded-2xl p-6 text-center cursor-pointer transition-all bg-[#050505]">
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
                        className="h-28 mx-auto object-cover rounded-lg border border-[#1C2329]"
                      />
                      <p className="text-xs text-[#00BFFF] font-semibold truncate">{screenshot?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-[#8B949E]">
                      <UploadCloud className="h-8 w-8 mx-auto text-[#00BFFF]" />
                      <p className="text-xs">Drag and drop or click to select image</p>
                      <p className="text-[10px] text-gray-500">Supports PNG, JPG, JPEG (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-950/40 border border-red-500/30 p-3 rounded-xl">{error}</p>
              )}

              {user ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary py-3.5 text-xs font-extrabold disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <span>{submitting ? 'Uploading Proof...' : 'Submit Payment Proof'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push(`/login?redirect=pricing?select=${selectedProgramId}`)}
                  className="w-full btn-secondary py-3.5 text-xs font-extrabold flex items-center justify-center space-x-2"
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
      <div className="flex justify-center items-center py-40 bg-[#050505]">
        <Dumbbell className="h-12 w-12 text-[#00BFFF] animate-spin" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
