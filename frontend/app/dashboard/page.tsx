'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { 
  Dumbbell, 
  Settings, 
  TrendingUp, 
  CreditCard, 
  Sparkles, 
  Download, 
  FileText, 
  Utensils, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Clock, 
  XCircle,
  BrainCircuit,
  Scale,
  MessageSquare,
  Send,
  Volume2,
  Paperclip,
  Megaphone,
  User,
  Activity,
  Heart
} from 'lucide-react';

const resolveMediaUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const path = url.startsWith('/') ? url : `/${url}`;
  const base = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8000'
    : '';
  return `${base}${path}`;
};

interface Program {
  id: number;
  title: string;
  description: string;
  price: number;
  type: string;
  pdf_url?: string;
}

interface Order {
  id: number;
  amount: number;
  screenshot_url: string;
  status: string;
  reject_reason?: string;
  created_at: string;
  program?: Program;
}

interface ProgressEntry {
  id: number;
  date: string;
  weight: number;
  measurements?: string;
}

interface AssignedPlan {
  id: number;
  title: string;
  description: string;
  type: string;
  content: string;
  file_url?: string;
  schedule_type: string;
  date_assigned: string;
}

interface ChatMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  content?: string;
  file_url?: string;
  file_type?: string;
  is_read: boolean;
  created_at: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export default function UserDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'plans' | 'ai' | 'progress' | 'chat' | 'announcements' | 'transactions'>('plans');
  
  // Loaded data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [unlockedPlans, setUnlockedPlans] = useState<Order[]>([]);
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [assignedPlans, setAssignedPlans] = useState<AssignedPlan[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [coach, setCoach] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Daily Logging Tracker States (Today's date)
  const todayStr = new Date().toISOString().split('T')[0];
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [mealsCompleted, setMealsCompleted] = useState(0);
  const [waterIntake, setWaterIntake] = useState(0);
  const [dailyNotes, setDailyNotes] = useState('');
  const [dailyWeight, setDailyWeight] = useState('');
  const [savingDailyLog, setSavingDailyLog] = useState(false);

  // AI Planner Form states
  const [aiType, setAiType] = useState<'workout' | 'diet'>('workout');
  const [workoutGoal, setWorkoutGoal] = useState('muscle gain');
  const [workoutLevel, setWorkoutLevel] = useState('intermediate');
  const [workoutEquipment, setWorkoutEquipment] = useState('full gym');
  const [dietGoal, setDietGoal] = useState('muscle gain');
  const [dietType, setDietType] = useState('non-vegetarian');
  const [dietCalories, setDietCalories] = useState(2500);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Progress Log Form states
  const [weight, setWeight] = useState('');
  const [chestSize, setChestSize] = useState('');
  const [bicepsSize, setBicepsSize] = useState('');
  const [waistSize, setWaistSize] = useState('');
  const [submittingProgress, setSubmittingProgress] = useState(false);

  // Chat system states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [chatFilePreview, setChatFilePreview] = useState<string | null>(null);
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'admin') {
        router.push('/admin');
      }
    }
  }, [user, authLoading, router]);

  const loadDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Load orders
      const orderData = await apiFetch('/api/orders/me', {}, token);
      setOrders(orderData);
      const approved = orderData.filter((o: any) => o.status === 'approved');
      setUnlockedPlans(approved);

      // Load progress entries
      const progressData = await apiFetch('/api/progress', {}, token);
      setProgressEntries(progressData);

      // Load assigned plans from coach
      const assignData = await apiFetch('/api/assignments/me', {}, token);
      setAssignedPlans(assignData);

      // Load announcements
      const annData = await apiFetch('/api/announcements', {}, token);
      setAnnouncements(annData);

      // Load daily log check-in status
      const dailyData = await apiFetch(`/api/logs/me?date_val=${todayStr}`, {}, token);
      if (dailyData) {
        setWorkoutCompleted(dailyData.workout_completed);
        setMealsCompleted(dailyData.meals_completed);
        setWaterIntake(dailyData.water_intake_ml);
        setDailyNotes(dailyData.notes || '');
        setDailyWeight(dailyData.weight ? dailyData.weight.toString() : '');
      }

      // Load coach account info for chat
      try {
        const coachData = await apiFetch('/api/chat/coach', {}, token);
        setCoach(coachData);
      } catch (coachErr) {
        console.error("Coach not registered in system yet:", coachErr);
      }
    } catch (err) {
      console.error("Error fetching dashboard details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  // Load chat messages when activeTab is chat
  useEffect(() => {
    let interval: any;
    if (activeTab === 'chat' && token && coach) {
      const fetchChat = async () => {
        try {
          const history = await apiFetch(`/api/chat/history?recipient_id=${coach.id}`, {}, token);
          setChatMessages(history);
          
          // Mark as read
          await apiFetch(`/api/chat/read?sender_id=${coach.id}`, { method: 'POST' }, token);
        } catch (err) {
          console.error("Error loading chat:", err);
        }
      };
      
      fetchChat();
      // Auto-refresh chat every 4 seconds for a real-time experience
      interval = setInterval(fetchChat, 4000);
    }
    return () => clearInterval(interval);
  }, [activeTab, token, coach]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSaveDailyLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingDailyLog(true);
    try {
      await apiFetch('/api/logs/me', {
        method: 'POST',
        body: JSON.stringify({
          date: todayStr,
          workout_completed: workoutCompleted,
          meals_completed: mealsCompleted,
          water_intake_ml: waterIntake,
          notes: dailyNotes,
          weight: dailyWeight ? parseFloat(dailyWeight) : null
        })
      }, token);
      alert("Today's tracking log updated successfully!");
      await loadDashboardData();
    } catch (err: any) {
      alert("Failed to save tracking log: " + err.message);
    } finally {
      setSavingDailyLog(false);
    }
  };

  const handleGenerateWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    setGeneratedPlan(null);
    try {
      const result = await apiFetch('/api/ai/workout-plan', {
        method: 'POST',
        body: JSON.stringify({
          goal: workoutGoal,
          level: workoutLevel,
          equipment: workoutEquipment
        })
      }, token || undefined);
      setGeneratedPlan(result.plan);
    } catch (err: any) {
      alert("AI Generation failed. Using cached fallback. " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateDiet = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    setGeneratedPlan(null);
    try {
      const result = await apiFetch('/api/ai/diet-plan', {
        method: 'POST',
        body: JSON.stringify({
          goal: dietGoal,
          diet_type: dietType,
          target_calories: dietCalories
        })
      }, token || undefined);
      setGeneratedPlan(result.plan);
    } catch (err: any) {
      alert("AI Generation failed. Using cached fallback. " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    setSubmittingProgress(true);
    
    const measurementsObj = {
      chest: chestSize ? parseFloat(chestSize) : undefined,
      biceps: bicepsSize ? parseFloat(bicepsSize) : undefined,
      waist: waistSize ? parseFloat(waistSize) : undefined,
    };

    try {
      await apiFetch('/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          date: todayStr,
          weight: parseFloat(weight),
          measurements: JSON.stringify(measurementsObj)
        })
      }, token || undefined);

      setWeight('');
      setChestSize('');
      setBicepsSize('');
      setWaistSize('');
      alert("Weekly log entry recorded successfully!");
      await loadDashboardData();
    } catch (err: any) {
      alert("Failed to log progress: " + err.message);
    } finally {
      setSubmittingProgress(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !coach || (!chatInput.trim() && !chatFile)) return;

    setSendingMsg(true);
    const formData = new FormData();
    formData.append('receiver_id', coach.id.toString());
    if (chatInput.trim()) {
      formData.append('content', chatInput);
    }
    if (chatFile) {
      formData.append('file', chatFile);
    }

    try {
      const sent = await apiFetch('/api/chat/send', {
        method: 'POST',
        body: formData
      }, token);
      setChatMessages([...chatMessages, sent]);
      setChatInput('');
      setChatFile(null);
      setChatFilePreview(null);
    } catch (err: any) {
      alert("Failed to send message: " + err.message);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleChatFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setChatFile(file);
      if (file.type.startsWith('image/')) {
        setChatFilePreview(URL.createObjectURL(file));
      } else {
        setChatFilePreview(null);
      }
    }
  };

  const downloadMockPDF = (title: string) => {
    const docText = `Gnaneswar_Fit CLIENT PLAN\nPlan: ${title}\nRegistered to: ${user?.name}\nStatus: Verified Client\nGenerated: ${new Date().toLocaleDateString()}`;
    const blob = new Blob([docText], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_plan.pdf`;
    link.click();
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Dumbbell className="h-12 w-12 text-gold animate-spin" />
      </div>
    );
  }

  // Filter assigned workouts and diet plans
  const assignedWorkouts = assignedPlans.filter(p => p.type === 'workout');
  const assignedDiets = assignedPlans.filter(p => p.type === 'diet');

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Welcome Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-card-border mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Hello, {user?.name}</h1>
          <p className="text-gray-400 text-sm mt-1">Track workouts, log measurements, and access your custom programming files.</p>
        </div>
        <div className="bg-[#050507] border border-card-border px-5 py-3 rounded-2xl flex items-center space-x-3">
          <Dumbbell className="h-6 w-6 text-gold" />
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Client Status</p>
            <p className="text-white font-bold text-xs">{(unlockedPlans.length > 0 || user?.role === 'admin') ? 'Premium Member' : 'Guest Account'}</p>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-2">
          <button 
            onClick={() => setActiveTab('plans')}
            className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-semibold flex items-center space-x-3 transition-colors ${
              activeTab === 'plans' ? 'bg-gold text-background shadow-[0_0_15px_var(--gold-glow)]' : 'bg-card-bg text-gray-300 border border-card-border hover:border-gold/50'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>Today's Log & Plans</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('ai')}
            disabled={unlockedPlans.length === 0 && user?.role !== 'admin'}
            className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-semibold flex items-center space-x-3 transition-all ${
              (unlockedPlans.length === 0 && user?.role !== 'admin') ? 'opacity-40 cursor-not-allowed' : ''
            } ${
              activeTab === 'ai' ? 'bg-gold text-background shadow-[0_0_15px_var(--gold-glow)]' : 'bg-card-bg text-gray-300 border border-card-border hover:border-gold/50'
            }`}
          >
            <BrainCircuit className="h-5 w-5" />
            <span className="flex items-center justify-between w-full">
              <span>AI Planners</span>
              {(unlockedPlans.length > 0 || user?.role === 'admin') && <Sparkles className="h-3.5 w-3.5" />}
            </span>
          </button>
          
          <button 
            onClick={() => setActiveTab('progress')}
            className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-semibold flex items-center space-x-3 transition-colors ${
              activeTab === 'progress' ? 'bg-gold text-background shadow-[0_0_15px_var(--gold-glow)]' : 'bg-card-bg text-gray-300 border border-card-border hover:border-gold/50'
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span>Progress Logs</span>
          </button>

          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-semibold flex items-center space-x-3 transition-colors ${
              activeTab === 'chat' ? 'bg-gold text-background shadow-[0_0_15px_var(--gold-glow)]' : 'bg-card-bg text-gray-300 border border-card-border hover:border-gold/50'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="flex justify-between items-center w-full">
              <span>Private Chat</span>
              {chatMessages.filter(m => !m.is_read && m.sender_id !== user?.id).length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">New</span>
              )}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('announcements')}
            className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-semibold flex items-center space-x-3 transition-colors ${
              activeTab === 'announcements' ? 'bg-gold text-background shadow-[0_0_15px_var(--gold-glow)]' : 'bg-card-bg text-gray-300 border border-card-border hover:border-gold/50'
            }`}
          >
            <Megaphone className="h-5 w-5" />
            <span>Announcements</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-semibold flex items-center space-x-3 transition-colors ${
              activeTab === 'transactions' ? 'bg-gold text-background shadow-[0_0_15px_var(--gold-glow)]' : 'bg-card-bg text-gray-300 border border-card-border hover:border-gold/50'
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span>Payments History</span>
          </button>
        </div>

        {/* Dynamic Panels */}
        <div className="lg:col-span-9">
          
          {/* Tab 1: Today's Log & Assigned Plans */}
          {activeTab === 'plans' && (
            <div className="space-y-8">
              {/* Daily Tracker check-in form */}
              <div className="glass-panel p-6 rounded-3xl border border-card-border">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-gold" />
                  <span>Today's Logging Tracker</span>
                </h3>
                
                <form onSubmit={handleSaveDailyLog} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 text-sm text-gray-300 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={workoutCompleted}
                        onChange={(e) => setWorkoutCompleted(e.target.checked)}
                        className="h-5 w-5 accent-gold bg-background border border-card-border rounded focus:ring-0"
                      />
                      <span>Mark Workout Completed</span>
                    </label>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Meals Completed</label>
                      <input 
                        type="number"
                        min={0}
                        max={10}
                        value={mealsCompleted}
                        onChange={(e) => setMealsCompleted(parseInt(e.target.value) || 0)}
                        className="w-full bg-background border border-card-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Water Intake (ml)</label>
                      <input 
                        type="number"
                        min={0}
                        step={250}
                        value={waterIntake}
                        onChange={(e) => setWaterIntake(parseInt(e.target.value) || 0)}
                        placeholder="e.g. 3000"
                        className="w-full bg-background border border-card-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Scale Weight (kg - optional)</label>
                      <input 
                        type="number"
                        step="0.1"
                        value={dailyWeight}
                        onChange={(e) => setDailyWeight(e.target.value)}
                        placeholder="e.g. 78.5"
                        className="w-full bg-background border border-card-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Today's Check-in Notes</label>
                      <input 
                        type="text"
                        value={dailyNotes}
                        onChange={(e) => setDailyNotes(e.target.value)}
                        placeholder="e.g. Felt strong during squats."
                        className="w-full bg-background border border-card-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={savingDailyLog}
                      className="w-full bg-gold text-background hover:scale-102 font-bold py-2 px-6 rounded-full transition-all text-sm flex items-center justify-center space-x-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{savingDailyLog ? 'Saving...' : 'Update Daily Log'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Workout Routine Plan */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Dumbbell className="h-5 w-5 text-gold" />
                  <span>My Active Workouts</span>
                </h3>
                
                {assignedWorkouts.length === 0 ? (
                  <div className="glass-panel p-8 rounded-3xl border border-card-border text-center text-gray-400 text-sm">
                    No active workout assigned by your coach for today. Custom workout plans appear here.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignedWorkouts.map(plan => (
                      <div key={plan.id} className="glass-panel p-6 rounded-3xl border border-card-border space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-bold text-white">{plan.title}</h4>
                            <p className="text-xs text-gray-400 capitalize mt-0.5">Assigned date: {plan.date_assigned} | {plan.schedule_type} schedule</p>
                          </div>
                          {plan.file_url && (
                            <a 
                              href={resolveMediaUrl(plan.file_url)} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-xs text-gold border border-gold/20 hover:border-gold px-3.5 py-1.5 rounded-full transition-all flex items-center space-x-1.5"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Download PDF</span>
                            </a>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed bg-[#050507] p-4 rounded-2xl border border-card-border whitespace-pre-wrap font-mono text-xs">{plan.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Diet Nutrition Plan */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Utensils className="h-5 w-5 text-gold" />
                  <span>My Diet & Meal Plans</span>
                </h3>
                
                {assignedDiets.length === 0 ? (
                  <div className="glass-panel p-8 rounded-3xl border border-card-border text-center text-gray-400 text-sm">
                    No custom diet plan assigned yet. Meal calorie sheets and nutrition guidelines appear here.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignedDiets.map(plan => (
                      <div key={plan.id} className="glass-panel p-6 rounded-3xl border border-card-border space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-bold text-white">{plan.title}</h4>
                            <p className="text-xs text-gray-400 capitalize mt-0.5">Assigned date: {plan.date_assigned} | {plan.schedule_type} schedule</p>
                          </div>
                          {plan.file_url && (
                            <a 
                              href={resolveMediaUrl(plan.file_url)} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-xs text-gold border border-gold/20 hover:border-gold px-3.5 py-1.5 rounded-full transition-all flex items-center space-x-1.5"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Download Diet PDF</span>
                            </a>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed bg-[#050507] p-4 rounded-2xl border border-card-border whitespace-pre-wrap font-mono text-xs">{plan.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: AI Planners */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">AI Planner Wizard</h2>
                <div className="flex border border-card-border rounded-full p-1 bg-background">
                  <button 
                    onClick={() => { setAiType('workout'); setGeneratedPlan(null); }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      aiType === 'workout' ? 'bg-gold text-background' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Workout Planner
                  </button>
                  <button 
                    onClick={() => { setAiType('diet'); setGeneratedPlan(null); }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      aiType === 'diet' ? 'bg-gold text-background' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Diet Planner
                  </button>
                </div>
              </div>

              {generatedPlan ? (
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-card-border space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-card-border">
                    <span className="text-xs font-bold text-gold flex items-center space-x-1.5">
                      <Sparkles className="h-4 w-4 animate-spin" />
                      <span>Plan Generated Successfully</span>
                    </span>
                    <button
                      onClick={() => setGeneratedPlan(null)}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Generate Another
                    </button>
                  </div>
                  
                  <textarea
                    readOnly
                    value={generatedPlan}
                    className="w-full h-96 bg-background border border-card-border rounded-2xl p-4 text-xs font-mono text-gray-300 focus:outline-none focus:border-card-border"
                  />
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        const blob = new Blob([generatedPlan], { type: 'text/markdown' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `custom_${aiType}_plan.md`;
                        link.click();
                      }}
                      className="gold-gradient-bg text-background font-bold px-6 py-2.5 rounded-full text-xs flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Markdown</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="glass-panel p-8 rounded-3xl border border-card-border">
                  {aiType === 'workout' ? (
                    <form onSubmit={handleGenerateWorkout} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-400">Target Goal</label>
                          <select 
                            value={workoutGoal}
                            onChange={(e) => setWorkoutGoal(e.target.value)}
                            className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                          >
                            <option value="muscle gain">Muscle Hypertrophy</option>
                            <option value="fat loss">Fat Shredding</option>
                            <option value="strength">Strength Focus</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-400">Experience Level</label>
                          <select 
                            value={workoutLevel}
                            onChange={(e) => setWorkoutLevel(e.target.value)}
                            className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced (Pro)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-400">Equipment Available</label>
                          <select 
                            value={workoutEquipment}
                            onChange={(e) => setWorkoutEquipment(e.target.value)}
                            className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                          >
                            <option value="full gym">Full Gym Facility</option>
                            <option value="dumbbells only">Dumbbells & Bench</option>
                            <option value="bodyweight only">Bodyweight Only</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={aiLoading}
                        className="w-full gold-gradient-bg text-background font-bold py-3 rounded-full hover:scale-102 transition-all flex items-center justify-center space-x-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>{aiLoading ? 'Synthesizing routine...' : 'Generate Workout Routine'}</span>
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleGenerateDiet} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-400">Fitness Objective</label>
                          <select 
                            value={dietGoal}
                            onChange={(e) => setDietGoal(e.target.value)}
                            className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                          >
                            <option value="muscle gain">Muscle Bulking</option>
                            <option value="fat loss">Shredding Cut</option>
                            <option value="maintenance">Body Recomposition</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-400">Dietary Preferences</label>
                          <select 
                            value={dietType}
                            onChange={(e) => setDietType(e.target.value)}
                            className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                          >
                            <option value="non-vegetarian">Non-Vegetarian</option>
                            <option value="vegetarian">Vegetarian (Lacto-Ovo)</option>
                            <option value="vegan">Vegan (Plant-Based)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-gray-400">Target Calories (Daily)</label>
                          <input 
                            type="number"
                            required
                            min={1200}
                            max={5000}
                            value={dietCalories}
                            onChange={(e) => setDietCalories(parseInt(e.target.value) || 2000)}
                            className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={aiLoading}
                        className="w-full gold-gradient-bg text-background font-bold py-3 rounded-full hover:scale-102 transition-all flex items-center justify-center space-x-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>{aiLoading ? 'Synthesizing macro model...' : 'Generate Macronutrient Diet'}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Progress Logs */}
          {activeTab === 'progress' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form card */}
              <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-card-border">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <Scale className="h-5 w-5 text-gold" />
                  <span>Log New Entry</span>
                </h3>
                
                <form onSubmit={handleLogProgress} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400">Scale Weight (kg)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      required
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g. 78.5"
                      className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400">Chest Size (inches - optional)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={chestSize}
                      onChange={(e) => setChestSize(e.target.value)}
                      placeholder="e.g. 40.5"
                      className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400">Biceps Size (inches - optional)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={bicepsSize}
                      onChange={(e) => setBicepsSize(e.target.value)}
                      placeholder="e.g. 15.2"
                      className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400">Waist Size (inches - optional)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={waistSize}
                      onChange={(e) => setWaistSize(e.target.value)}
                      placeholder="e.g. 32.0"
                      className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingProgress}
                    className="w-full bg-transparent border border-gold text-gold hover:bg-gold hover:text-background font-bold py-2.5 rounded-full text-xs transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{submittingProgress ? 'Saving...' : 'Add Log'}</span>
                  </button>
                </form>
              </div>

              {/* History list & simple chart */}
              <div className="lg:col-span-7 space-y-6">
                {progressEntries.length > 0 && (
                  <div className="glass-panel p-6 rounded-3xl border border-card-border">
                    <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Weight Progress Chart</h3>
                    <div className="h-40 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-card-border">
                      {progressEntries.slice(0, 10).reverse().map((entry, idx) => {
                        const maxWeight = Math.max(...progressEntries.map(e => e.weight), 100);
                        const minWeight = Math.min(...progressEntries.map(e => e.weight), 50);
                        const range = maxWeight - minWeight || 10;
                        const heightPct = Math.max(10, Math.min(100, ((entry.weight - minWeight) / range) * 80 + 20));
                        return (
                          <div key={entry.id} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                            {/* Bar */}
                            <div 
                              style={{ height: `${heightPct}%` }}
                              className="w-full bg-gold/80 rounded-t group-hover:bg-gold transition-all duration-300 relative"
                            >
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap mb-1">
                                {entry.weight} kg
                              </div>
                            </div>
                            <span className="text-[8px] text-gray-500 mt-2 truncate w-full text-center">{entry.date.slice(5)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white mb-2">History Records</h3>
                  
                  {progressEntries.length === 0 ? (
                    <div className="glass-panel p-8 rounded-3xl border border-card-border text-center text-gray-400 text-sm">
                      No progress logged yet. Keep logs weekly to track adaptations.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {progressEntries.map((entry) => {
                        const measurements = entry.measurements ? JSON.parse(entry.measurements) : {};
                        return (
                          <div key={entry.id} className="glass-panel p-4 rounded-xl border border-card-border flex justify-between items-center text-sm">
                            <div className="flex items-center space-x-4">
                              <div className="h-10 w-10 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center text-gold">
                                <Calendar className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-bold text-white">{entry.weight} kg</p>
                                <p className="text-[10px] text-gray-500">{entry.date}</p>
                              </div>
                            </div>
                            <div className="text-right text-xs text-gray-400 space-y-0.5">
                              {measurements.chest && <p>Chest: {measurements.chest}"</p>}
                              {measurements.biceps && <p>Biceps: {measurements.biceps}"</p>}
                              {measurements.waist && <p>Waist: {measurements.waist}"</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Private Chat Room */}
          {activeTab === 'chat' && (
            <div className="glass-panel rounded-3xl border border-card-border h-[600px] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="border-b border-card-border p-5 bg-[#050507] flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gold/20 rounded-full flex items-center justify-center text-gold font-bold">
                    {coach?.name ? coach.name.charAt(0) : 'C'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{coach?.name || 'Coach Gnaneswar'}</h3>
                    <p className="text-[10px] text-green-400 flex items-center space-x-1">
                      <span className="h-1.5 w-1.5 bg-green-500 rounded-full inline-block animate-ping"></span>
                      <span>Online Support</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-background/30">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 text-xs">
                    No chat logs with coach yet. Drop a message to introduce yourself or ask a question!
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div 
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs sm:max-w-md p-4 rounded-2xl border text-sm space-y-1.5 ${
                          isMe 
                            ? 'bg-gold/10 border-gold/30 text-white rounded-br-none' 
                            : 'bg-card-bg border-card-border text-gray-300 rounded-bl-none'
                        }`}>
                          {msg.content && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                          
                          {/* File Attachment */}
                          {msg.file_url && (
                            <div className="mt-1 pt-1.5 border-t border-white/10">
                              {msg.file_type === 'image' ? (
                                <img src={resolveMediaUrl(msg.file_url)} alt="Attachment" className="max-h-48 rounded object-cover" />
                              ) : msg.file_type === 'voice' ? (
                                <audio src={resolveMediaUrl(msg.file_url)} controls className="max-w-[200px] scale-90 origin-left" />
                              ) : (
                                <a 
                                  href={resolveMediaUrl(msg.file_url)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-gold flex items-center space-x-1.5 hover:underline"
                                >
                                  <Paperclip className="h-3 w-3" />
                                  <span>View Attachment File</span>
                                </a>
                              )}
                            </div>
                          )}
                          <p className="text-[8px] text-gray-500 text-right">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Form Input */}
              <form onSubmit={handleSendChatMessage} className="p-4 border-t border-card-border bg-[#050507] space-y-3">
                {chatFilePreview && (
                  <div className="relative inline-block mt-1">
                    <img src={chatFilePreview} alt="Preview" className="h-16 w-16 object-cover rounded border border-card-border" />
                    <button 
                      type="button" 
                      onClick={() => { setChatFile(null); setChatFilePreview(null); }}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 text-[8px] hover:bg-red-600"
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer text-gray-400 hover:text-gold transition-colors p-1.5 rounded-full hover:bg-white/5">
                    <Paperclip className="h-5 w-5" />
                    <input 
                      type="file" 
                      accept="image/*, application/pdf, audio/*" 
                      onChange={handleChatFileChange}
                      className="hidden" 
                    />
                  </label>
                  
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type message to Coach Gnaneswar..."
                    className="flex-1 bg-background border border-card-border focus:border-gold/50 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                  />
                  
                  <button
                    type="submit"
                    disabled={sendingMsg}
                    className="gold-gradient-bg text-background p-3 rounded-xl hover:scale-105 transition-all disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 5: Announcements feed */}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-2">Coach Broadcast Announcements</h2>
              
              {announcements.length === 0 ? (
                <div className="glass-panel p-8 rounded-3xl border border-card-border text-center text-gray-400 text-sm">
                  No announcements posted yet. Coach motivational check-ins and board notices appear here.
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="glass-panel p-6 rounded-2xl border border-card-border space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gold text-lg">{ann.title}</h3>
                        <span className="text-[10px] text-gray-500">{new Date(ann.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 6: Payments Logs */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-2">Transaction History</h2>
              
              {orders.length === 0 ? (
                <div className="glass-panel p-8 rounded-3xl border border-card-border text-center text-gray-400 text-sm">
                  No transaction screenshot logs found in this account.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      className="glass-panel p-5 rounded-2xl border border-card-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-11 w-11 bg-card-bg border border-card-border rounded-xl flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-gold/80" />
                        </div>
                        <div>
                          <p className="font-bold text-white">{order.program?.title || 'Program Purchase'}</p>
                          <p className="text-[10px] text-gray-500">Ref ID: ORDER-{order.id} | Amount: ₹{order.amount}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {order.status === 'approved' && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 border border-green-500/20 text-green-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approved</span>
                          </span>
                        )}
                        {order.status === 'pending' && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
                            <Clock className="h-3.5 w-3.5 animate-pulse" />
                            <span>Verification Pending</span>
                          </span>
                        )}
                        {order.status === 'rejected' && (
                          <div className="text-right">
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400">
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Rejected</span>
                            </span>
                            {order.reject_reason && (
                              <p className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate">{order.reject_reason}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
