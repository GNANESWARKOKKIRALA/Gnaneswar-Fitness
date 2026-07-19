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
  Heart,
  Printer,
  Award,
  Target
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
  
  const [activeTab, setActiveTab] = useState<'plans' | 'ai' | 'progress' | 'chat' | 'announcements' | 'transactions' | 'recovery' | 'gamification'>('plans');
  
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

  // Invoice modal states
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // AI Sub-Tabs
  const [aiSubTab, setAiSubTab] = useState<'wizard' | 'autoreg' | 'cgm'>('wizard');
  
  // AI Autoregulator states
  const [activeExercise, setActiveExercise] = useState('Incline Barbell Bench Press');
  const [loggedWeight, setLoggedWeight] = useState('135');
  const [loggedReps, setLoggedReps] = useState('8');
  const [loggedRpe, setLoggedRpe] = useState(8);
  const [autoregFeedback, setAutoregFeedback] = useState('');
  const [completedSets, setCompletedSets] = useState<Array<{exercise: string, weight: number, reps: number, rpe: number, feedback: string}>>([
    { exercise: "Incline Barbell Bench Press", weight: 135, reps: 8, rpe: 8, feedback: "Optimal stimulation. Maintain weight." }
  ]);
  const [muscleFatigue, setMuscleFatigue] = useState({ chest: 20, shoulders: 10, back: 0, legs: 0, arms: 5 });

  // AI CGM states
  const [mealsList, setMealsList] = useState<Array<{time: string, name: string, carbs: number}>>([
    { time: "08:00 AM", name: "Oats & Egg Whites", carbs: 55 },
    { time: "01:30 PM", name: "Chicken, Rice & Broccoli", carbs: 65 }
  ]);
  const [glucoseTimeline, setGlucoseTimeline] = useState<Array<{time: string, level: number}>>([
    { time: "08:00", level: 85 },
    { time: "09:00", level: 125 },
    { time: "10:00", level: 110 },
    { time: "11:00", level: 95 },
    { time: "12:00", level: 88 },
    { time: "13:00", level: 85 },
    { time: "14:00", level: 130 },
    { time: "15:00", level: 115 },
    { time: "16:00", level: 98 },
    { time: "17:00", level: 90 },
    { time: "18:00", level: 87 },
    { time: "19:00", level: 85 },
    { time: "20:00", level: 82 }
  ]);
  const [ingestedMealName, setIngestedMealName] = useState('Pre-workout Oats');
  const [ingestedMealCarbs, setIngestedMealCarbs] = useState('50');
  const [swappedMeal, setSwappedMeal] = useState<{ original: string, alternate: string, calories: number, protein: number, carbs: number, fats: number } | null>(null);

  // AI Chat states
  const [chatMode, setChatMode] = useState<'coach' | 'ai'>('coach');
  const [aiChatMessages, setAiChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    { role: 'assistant', content: "Hello! I am your AI Bodybuilding & Diet Coach. Ask me any questions about exercises, calories, macros, or recovery blueprints, and let's get after it!" }
  ]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatLoading, setAiChatLoading] = useState(false);

  // Recovery Tab states
  const [soreShoulders, setSoreShoulders] = useState(false);
  const [soreBack, setSoreBack] = useState(false);
  const [soreLegs, setSoreLegs] = useState(false);
  const [soreChest, setSoreChest] = useState(false);
  const [soreArms, setSoreArms] = useState(false);
  const [somaticRoutine, setSomaticRoutine] = useState<Array<{name: string, duration: string, tool: string}>>([]);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(900); // 15 mins for Sauna default
  const [timerActive, setTimerActive] = useState(false);
  const [activeTherapy, setActiveTherapy] = useState<'sauna' | 'cold'>('sauna');

  // Gamification Tab states
  const [avatarXp, setAvatarXp] = useState(450);
  const [avatarLevel, setAvatarLevel] = useState(5);
  const [sweatTokens, setSweatTokens] = useState(150);
  const [tokenHistory, setTokenHistory] = useState<Array<{ desc: string, amount: number, type: 'earn' | 'redeem', date: string }>>([
    { desc: "Initial Vagus Recovery Log", amount: 15, type: 'earn', date: "2026-07-18" },
    { desc: "Auto-regulation RPE Log", amount: 10, type: 'earn', date: "2026-07-18" },
    { desc: "Welcome Bonus", amount: 125, type: 'earn', date: "2026-07-17" }
  ]);
  const [contractActive, setContractActive] = useState(false);
  const [contractTarget, setContractTarget] = useState(4);
  const [contractPledge, setContractPledge] = useState(50);
  const [contractProgress, setContractProgress] = useState(1);



  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'admin') {
        router.push('/admin');
      }
    }
  }, [user, authLoading, router]);

  // Contrast timer tick effect
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0) {
      setTimerActive(false);
      alert(`${activeTherapy === 'sauna' ? 'Sauna session' : 'Cold plunge session'} completed!`);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timerSecondsLeft, activeTherapy]);

  // Dynamic Somatic reset generator function
  const handleGenerateSomaticReset = () => {
    const routine = [];
    if (soreBack) {
      routine.push({ name: "Spinal Decompression Hang (Dead Hang)", duration: "3 mins", tool: "Pull-up bar" });
      routine.push({ name: "Somatic Cat-Cow Movements", duration: "2 mins", tool: "Yoga Mat" });
    }
    if (soreShoulders) {
      routine.push({ name: "Band Dislocates / Shoulder Openers", duration: "3 mins", tool: "Resistance Band" });
      routine.push({ name: "Lats & Thoracic Foam Rolling", duration: "2 mins", tool: "Foam Roller" });
    }
    if (soreLegs) {
      routine.push({ name: "Banded Flossing / Joint distraction", duration: "4 mins", tool: "Compression band" });
      routine.push({ name: "Couch Stretch (Deep hip opening)", duration: "3 mins", tool: "Wall / Couch" });
    }
    if (soreChest) {
      routine.push({ name: "Pec Minor doorway stretch", duration: "3 mins", tool: "Door Frame" });
      routine.push({ name: "Chest myofascial release", duration: "2 mins", tool: "Lacrosse Ball" });
    }
    if (soreArms) {
      routine.push({ name: "Wrist extensor self-massage", duration: "2 mins", tool: "Massage Oil" });
      routine.push({ name: "Tricep overhead banded stretch", duration: "3 mins", tool: "Resistance Band" });
    }

    if (routine.length === 0) {
      routine.push({ name: "Vagus Nerve stimulation diaphragmatic breathing", duration: "5 mins", tool: "Calm Space" });
      routine.push({ name: "Somatic full body shaking / tension release", duration: "3 mins", tool: "Yoga Mat" });
    }

    setSomaticRoutine(routine);
  };

  const handleRedeemReward = (rewardName: string, cost: number) => {
    if (sweatTokens < cost) {
      alert("Insufficient SweatTokens! Keep training to earn more.");
      return;
    }
    setSweatTokens(prev => prev - cost);
    setTokenHistory(prev => [
      { desc: `Redeemed: ${rewardName}`, amount: cost, type: 'redeem', date: new Date().toISOString().split('T')[0] },
      ...prev
    ]);
    alert(`Successfully redeemed: ${rewardName}! Check your email for details.`);
  };

  const handleCreateContract = (target: number, pledge: number) => {
    if (sweatTokens < pledge) {
      alert("Insufficient SweatTokens to pledge for this commitment contract.");
      return;
    }
    setSweatTokens(prev => prev - pledge);
    setTokenHistory(prev => [
      { desc: `Pledged to Anti-Sloth Contract`, amount: pledge, type: 'redeem', date: new Date().toISOString().split('T')[0] },
      ...prev
    ]);
    setContractTarget(target);
    setContractPledge(pledge);
    setContractProgress(0);
    setContractActive(true);
    alert(`Anti-Sloth Contract activated! Pledged ${pledge} SweatTokens for a ${target} workout goal.`);
  };



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

  const handleSendAIChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !aiChatInput.trim() || aiChatLoading) return;
    
    const userMsg = { role: 'user' as const, content: aiChatInput };
    setAiChatMessages(prev => [...prev, userMsg]);
    setAiChatInput('');
    setAiChatLoading(true);
    
    try {
      const data = await apiFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userMsg.content,
          history: aiChatMessages.slice(1)
        })
      }, token);
      
      setAiChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      setAiChatMessages(prev => [...prev, { role: 'assistant', content: "AI Coach: Oops! I failed to resolve that query. Please make sure the server has a valid Groq API key configured." }]);
    } finally {
      setAiChatLoading(false);
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

  const handleAutoregulateSet = () => {
    const w = parseFloat(loggedWeight);
    const r = parseInt(loggedReps);
    const rpe = loggedRpe;
    if (isNaN(w) || isNaN(r)) return;

    let suggestion = '';
    if (rpe < 7) {
      suggestion = "RPE is very low. Increase weight by 5-10% to meet target stimulation.";
    } else if (rpe === 7 || rpe === 8) {
      suggestion = "Optimal hypertrophy zone. Increase weight slightly (+5 lbs) on next set if feeling strong.";
    } else if (rpe === 9) {
      suggestion = "Perfect intensity. Maintain this weight for remaining sets.";
    } else {
      suggestion = "Maximum failure reached. Reduce weight by 5-10% to prevent form breakdown.";
    }

    const newSet = { exercise: activeExercise, weight: w, reps: r, rpe, feedback: suggestion };
    setCompletedSets(prev => [newSet, ...prev]);

    const exLower = activeExercise.toLowerCase();
    setMuscleFatigue(prev => {
      const next = { ...prev };
      if (exLower.includes('bench') || exLower.includes('press') || exLower.includes('fly')) {
        next.chest = Math.min(100, next.chest + 20);
        next.shoulders = Math.min(100, next.shoulders + 10);
      } else if (exLower.includes('squat') || exLower.includes('leg') || exLower.includes('deadlift')) {
        next.legs = Math.min(100, next.legs + 25);
        next.back = Math.min(100, next.back + 10);
      } else if (exLower.includes('row') || exLower.includes('pull')) {
        next.back = Math.min(100, next.back + 20);
        next.arms = Math.min(100, next.arms + 10);
      } else if (exLower.includes('curl') || exLower.includes('extension')) {
        next.arms = Math.min(100, next.arms + 25);
      }
      return next;
    });

    // Gamification rewards
    setAvatarXp(prev => {
      const nextXp = prev + 50;
      if (nextXp >= 1000) {
        setAvatarLevel(l => l + 1);
        return nextXp - 1000;
      }
      return nextXp;
    });
    setSweatTokens(prev => prev + 15);
    setTokenHistory(prev => [
      { desc: `Logged Set: ${activeExercise} (RPE ${rpe})`, amount: 15, type: 'earn', date: new Date().toISOString().split('T')[0] },
      ...prev
    ]);

    if (contractActive) {
      setContractProgress(prev => {
        const nextVal = prev + 1;
        if (nextVal >= contractTarget) {
          const reward = contractPledge * 2;
          setSweatTokens(tokens => tokens + reward);
          setTokenHistory(hist => [
            { desc: `Won Commitment Contract!`, amount: reward, type: 'earn', date: new Date().toISOString().split('T')[0] },
            ...hist
          ]);
          setContractActive(false);
          alert(`🎉 Anti-Sloth Target Hit! You completed your Commitment Contract and earned ${reward} SweatTokens!`);
        }
        return nextVal;
      });
    }

    setAutoregFeedback(suggestion);
  };


  const handleIngestMeal = () => {
    const carbs = parseFloat(ingestedMealCarbs);
    if (isNaN(carbs) || !ingestedMealName.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMealsList(prev => [{ time: timeStr, name: ingestedMealName, carbs }, ...prev]);

    // Simulate CGM spike
    setGlucoseTimeline(prev => {
      return prev.map((pt, idx) => {
        const tDiff = idx - 4; // simulated relative time index
        if (tDiff >= 0 && tDiff <= 5) {
          const spikeAmount = carbs * 0.7 * Math.sin((tDiff / 5) * Math.PI);
          return { ...pt, level: Math.round(pt.level + spikeAmount) };
        }
        return pt;
      });
    });
  };

  const handleSwapMealOption = (mealName: string, protocol: 'keto' | 'vegan') => {
    if (protocol === 'vegan') {
      setSwappedMeal({
        original: mealName,
        alternate: "Grilled marinated Tempeh, quinoa brown rice blend with steamed broccoli, toasted sesame dressing, and raw pumpkin seeds.",
        calories: 520,
        protein: 34,
        carbs: 58,
        fats: 15
      });
    } else {
      setSwappedMeal({
        original: mealName,
        alternate: "Slow-baked Salmon fillet, pan-seared asparagus in avocado oil, dressed with walnuts and sliced avocado (Keto high-fat profile).",
        calories: 610,
        protein: 42,
        carbs: 6,
        fats: 45
      });
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
            onClick={() => setActiveTab('recovery')}
            className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-semibold flex items-center space-x-3 transition-colors ${
              activeTab === 'recovery' ? 'bg-gold text-background shadow-[0_0_15px_var(--gold-glow)]' : 'bg-card-bg text-gray-300 border border-card-border hover:border-gold/50'
            }`}
          >
            <Heart className="h-5 w-5" />
            <span>Recovery Hub</span>
          </button>

          <button 
            onClick={() => setActiveTab('gamification')}
            className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-semibold flex items-center space-x-3 transition-colors ${
              activeTab === 'gamification' ? 'bg-gold text-background shadow-[0_0_15px_var(--gold-glow)]' : 'bg-card-bg text-gray-300 border border-card-border hover:border-gold/50'
            }`}
          >
            <Award className="h-5 w-5" />
            <span>Gamification Hub</span>
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
              {/* AI Sub-Tabs Navigation */}
              <div className="flex flex-wrap gap-2 border-b border-card-border pb-4">
                <button
                  onClick={() => setAiSubTab('wizard')}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                    aiSubTab === 'wizard'
                      ? 'bg-gold text-background shadow-[0_0_10px_var(--gold-glow)]'
                      : 'bg-card-bg text-gray-400 hover:text-white border border-card-border'
                  }`}
                >
                  AI Planner Wizard
                </button>
                <button
                  onClick={() => setAiSubTab('autoreg')}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                    aiSubTab === 'autoreg'
                      ? 'bg-gold text-background shadow-[0_0_10px_var(--gold-glow)]'
                      : 'bg-card-bg text-gray-400 hover:text-white border border-card-border'
                  }`}
                >
                  AI Autoregulator Hub
                </button>
                <button
                  onClick={() => setAiSubTab('cgm')}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                    aiSubTab === 'cgm'
                      ? 'bg-gold text-background shadow-[0_0_10px_var(--gold-glow)]'
                      : 'bg-card-bg text-gray-400 hover:text-white border border-card-border'
                  }`}
                >
                  Bio-Nutrition CGM
                </button>
              </div>

              {/* Sub-Tab 1: Wizard (AI Planner) */}
              {aiSubTab === 'wizard' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">AI Program Generator</h2>
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

              {/* Sub-Tab 2: Autoregulator (Set Logging & Muscle Fatigue) */}
              {aiSubTab === 'autoreg' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Interactive Set Logger */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="glass-panel p-6 rounded-3xl border border-card-border space-y-4">
                      <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-gold" />
                        <span>Interactive RPE Autoregulator</span>
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Log details for your current workout set. The AI coach calculates set difficulty and outputs velocity adaptation hints instantly.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400">Exercise Name</label>
                          <select 
                            value={activeExercise} 
                            onChange={(e) => setActiveExercise(e.target.value)}
                            className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                          >
                            <option value="Incline Barbell Bench Press">Incline Barbell Bench Press</option>
                            <option value="Barbell Squats">Barbell Squats</option>
                            <option value="Lat Pulldowns">Lat Pulldowns</option>
                            <option value="Dumbbell Curls">Dumbbell Curls</option>
                            <option value="Tricep Extensions">Tricep Extensions</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400">Weight</label>
                            <input 
                              type="number" 
                              value={loggedWeight} 
                              onChange={(e) => setLoggedWeight(e.target.value)}
                              className="w-full bg-background border border-card-border rounded-xl px-2 py-3 text-xs text-white text-center focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400">Reps</label>
                            <input 
                              type="number" 
                              value={loggedReps} 
                              onChange={(e) => setLoggedReps(e.target.value)}
                              className="w-full bg-background border border-card-border rounded-xl px-2 py-3 text-xs text-white text-center focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400">RPE (1-10)</label>
                            <select 
                              value={loggedRpe} 
                              onChange={(e) => setLoggedRpe(parseInt(e.target.value))}
                              className="w-full bg-background border border-card-border rounded-xl px-2 py-3 text-xs text-white text-center focus:outline-none"
                            >
                              {[...Array(10)].map((_, i) => (
                                <option key={i+1} value={i+1}>{i+1}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleAutoregulateSet}
                        className="w-full bg-gold hover:bg-gold/90 text-background font-bold py-3 rounded-xl transition-all duration-300 text-xs flex items-center justify-center space-x-1 shadow-[0_0_10px_var(--gold-glow)]"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Log & Autoregulate Set</span>
                      </button>

                      {autoregFeedback && (
                        <div className="border border-gold/30 bg-gold/5 rounded-2xl p-4 space-y-2 animate-fadeIn">
                          <p className="text-[10px] text-gold uppercase tracking-widest font-bold">AI Coach Feedback</p>
                          <p className="text-xs text-gray-300 leading-relaxed font-semibold">{autoregFeedback}</p>
                        </div>
                      )}
                    </div>

                    {/* Logged Sets History */}
                    <div className="glass-panel p-6 rounded-3xl border border-card-border space-y-3">
                      <h4 className="text-sm font-bold text-white">Logged Workout History</h4>
                      {completedSets.length === 0 ? (
                        <p className="text-xs text-gray-500">No sets logged yet today.</p>
                      ) : (
                        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                          {completedSets.map((set, idx) => (
                            <div key={idx} className="bg-black/30 border border-card-border p-3.5 rounded-xl flex justify-between items-start gap-4">
                              <div>
                                <h5 className="text-xs font-bold text-white">{set.exercise}</h5>
                                <p className="text-[10px] text-gray-500 mt-0.5">Weight: {set.weight} lbs | Reps: {set.reps} | RPE: {set.rpe}</p>
                              </div>
                              <span className="text-[10px] text-gold font-medium bg-gold/5 border border-gold/10 px-2 py-0.5 rounded italic truncate max-w-[180px]">
                                {set.feedback}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Muscle Fatigue Heat Map */}
                  <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-card-border space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-white">Muscle Activation Matrix</h3>
                      <p className="text-xs text-gray-400 mt-1">Simulated muscle fatigue index. Target low fatigue areas next.</p>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(muscleFatigue).map(([muscle, value]) => (
                        <div key={muscle} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="capitalize font-bold text-white">{muscle}</span>
                            <span className={`font-semibold ${value > 60 ? 'text-red-400' : value > 30 ? 'text-amber-400' : 'text-green-400'}`}>
                              {value}% Fatigue
                            </span>
                          </div>
                          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-card-border">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                value > 60 ? 'bg-red-500' : value > 30 ? 'bg-amber-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 3: Bio-Nutrition CGM & Swapper */}
              {aiSubTab === 'cgm' && (
                <div className="space-y-6">
                  {/* Interactive CGM chart */}
                  <div className="glass-panel p-6 rounded-3xl border border-card-border space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                          <Heart className="h-5 w-5 text-red-500" />
                          <span>Continuous Glucose Monitor (CGM) Modeling</span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Continuous 24-hr insulin sensitivity spikes. Target area: 80-120 mg/dL.</p>
                      </div>

                      {/* Ingest Form */}
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={ingestedMealName} 
                          onChange={(e) => setIngestedMealName(e.target.value)}
                          placeholder="Meal name"
                          className="bg-background border border-card-border rounded-xl px-3 py-2 text-xs text-white max-w-[130px] focus:outline-none"
                        />
                        <input 
                          type="number" 
                          value={ingestedMealCarbs} 
                          onChange={(e) => setIngestedMealCarbs(e.target.value)}
                          placeholder="Carbs (g)"
                          className="bg-background border border-card-border rounded-xl px-3 py-2 text-xs text-white max-w-[80px] focus:outline-none"
                        />
                        <button
                          onClick={handleIngestMeal}
                          className="bg-gold hover:bg-gold/90 text-background text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300"
                        >
                          Ingest Meal
                        </button>
                      </div>
                    </div>

                    {/* SVG CGM Chart */}
                    <div className="relative bg-black/40 border border-card-border rounded-2xl p-4">
                      <svg viewBox="0 0 500 180" className="w-full h-auto overflow-visible">
                        {/* Grid lines */}
                        <line x1="0" y1="130" x2="500" y2="130" stroke="#333" strokeDasharray="3" />
                        <line x1="0" y1="50" x2="500" y2="50" stroke="#333" strokeDasharray="3" />
                        <text x="5" y="142" fill="#555" className="text-[8px] font-mono">80 mg/dL (Low Target)</text>
                        <text x="5" y="42" fill="#555" className="text-[8px] font-mono">120 mg/dL (High Target)</text>

                        {/* Glucose Curve path */}
                        <path
                          d={`M ${glucoseTimeline.map((pt, idx) => {
                            const x = (idx / (glucoseTimeline.length - 1)) * 500;
                            // scale glucose levels (80-140) to height range (160 to 20)
                            const y = 160 - ((pt.level - 80) / (140 - 80)) * 140;
                            return `${x} ${y}`;
                          }).join(" L ")}`}
                          fill="none"
                          stroke="url(#glucose-gradient)"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />

                        {/* Area glow */}
                        <path
                          d={`M 0 180 L 0 ${160 - ((glucoseTimeline[0].level - 80) / (140 - 80)) * 140} L ${glucoseTimeline.map((pt, idx) => {
                            const x = (idx / (glucoseTimeline.length - 1)) * 500;
                            const y = 160 - ((pt.level - 80) / (140 - 80)) * 140;
                            return `${x} ${y}`;
                          }).join(" L ")} L 500 180 Z`}
                          fill="url(#area-gradient)"
                          opacity="0.15"
                        />

                        {/* Data dots */}
                        {glucoseTimeline.map((pt, idx) => {
                          const x = (idx / (glucoseTimeline.length - 1)) * 500;
                          const y = 160 - ((pt.level - 80) / (140 - 80)) * 140;
                          return (
                            <g key={idx} className="group cursor-pointer">
                              <circle cx={x} cy={y} r="4" fill={pt.level > 120 ? '#EF4444' : '#F59E0B'} />
                              <text x={x - 10} y={y - 10} fill="#FFF" className="text-[7px] opacity-0 group-hover:opacity-100 transition-opacity bg-black font-mono font-bold px-1 rounded">
                                {pt.time}: {pt.level}
                              </text>
                            </g>
                          );
                        })}

                        {/* Definitions */}
                        <defs>
                          <linearGradient id="glucose-gradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#F59E0B" />
                            <stop offset="50%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#EF4444" />
                          </linearGradient>
                          <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F59E0B" />
                            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* Meal intake log timeline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ingested Foods Index</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {mealsList.map((meal, idx) => (
                            <div key={idx} className="bg-black/30 border border-card-border p-3 rounded-xl flex justify-between items-center text-xs">
                              <div>
                                <p className="font-bold text-white">{meal.name}</p>
                                <p className="text-[10px] text-gray-500">{meal.time}</p>
                              </div>
                              <span className="bg-gold/10 border border-gold/20 text-gold font-bold px-2.5 py-0.5 rounded-full">{meal.carbs}g Carbs</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Swapper Tool */}
                      <div className="space-y-3 bg-[#050507] p-5 rounded-2xl border border-card-border">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1">
                          <Sparkles className="h-3.5 w-3.5 text-gold" />
                          <span>Synthetic Ingredient Swapper</span>
                        </h4>
                        <p className="text-[10px] text-gray-400">Select dietary swaps for the breakfast block (Oats & Egg Whites):</p>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSwapMealOption("Oats & Egg Whites", "vegan")}
                            className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold py-2 rounded-xl transition-all duration-300"
                          >
                            Swap to Vegan (Tempeh)
                          </button>
                          <button
                            onClick={() => handleSwapMealOption("Oats & Egg Whites", "keto")}
                            className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold py-2 rounded-xl transition-all duration-300"
                          >
                            Swap to Keto (Salmon)
                          </button>
                        </div>

                        {swappedMeal && (
                          <div className="border border-card-border bg-black/40 p-4 rounded-xl space-y-3.5 animate-fadeIn text-xs">
                            <p className="text-[9px] text-gold uppercase tracking-widest font-bold">Swapped Plate Proposal</p>
                            <p className="text-white font-medium leading-relaxed">{swappedMeal.alternate}</p>
                            
                            <div className="grid grid-cols-4 gap-2 text-[10px] text-center">
                              <div className="bg-card-bg border border-card-border p-1.5 rounded-lg">
                                <p className="text-gray-500 uppercase tracking-wider">Cals</p>
                                <p className="text-white font-bold mt-0.5">{swappedMeal.calories}</p>
                              </div>
                              <div className="bg-card-bg border border-card-border p-1.5 rounded-lg">
                                <p className="text-gray-500 uppercase tracking-wider">Prot</p>
                                <p className="text-white font-bold mt-0.5">{swappedMeal.protein}g</p>
                              </div>
                              <div className="bg-card-bg border border-card-border p-1.5 rounded-lg">
                                <p className="text-gray-500 uppercase tracking-wider">Carb</p>
                                <p className="text-white font-bold mt-0.5">{swappedMeal.carbs}g</p>
                              </div>
                              <div className="bg-card-bg border border-card-border p-1.5 rounded-lg">
                                <p className="text-gray-500 uppercase tracking-wider">Fats</p>
                                <p className="text-white font-bold mt-0.5">{swappedMeal.fats}g</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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

          {/* Tab 4: Private Chat Room & AI Coach */}
          {activeTab === 'chat' && (
            <div className="glass-panel rounded-3xl border border-card-border h-[600px] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="border-b border-card-border p-5 bg-[#050507] flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                <div className="flex items-center space-x-3">
                  {chatMode === 'coach' ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <div className="h-10 w-10 bg-gold/20 rounded-full flex items-center justify-center text-gold font-bold">
                        AI
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">AI Fitness Assistant</h3>
                        <p className="text-[10px] text-gold flex items-center space-x-1">
                          <BrainCircuit className="h-3 w-3 animate-pulse" />
                          <span>Always Active</span>
                        </p>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Chat Mode Toggle */}
                <div className="flex bg-background border border-card-border p-1 rounded-xl shrink-0 self-start sm:self-auto">
                  <button
                    onClick={() => setChatMode('coach')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      chatMode === 'coach' ? 'bg-gold text-background shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Personal Coach
                  </button>
                  <button
                    onClick={() => setChatMode('ai')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      chatMode === 'ai' ? 'bg-gold text-background shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    AI Coach Assistant
                  </button>
                </div>
              </div>

              {/* Message List & Forms based on active mode */}
              {chatMode === 'coach' ? (
                <>
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
                        disabled={sendingMsg || (!chatInput.trim() && !chatFile)}
                        className="gold-gradient-bg text-background px-6 py-3 rounded-xl text-xs font-bold shadow-[0_0_12px_var(--gold-glow)] hover:scale-105 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-1"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Send</span>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-background/30">
                    {aiChatMessages.map((msg, index) => {
                      const isMe = msg.role === 'user';
                      return (
                        <div 
                          key={index}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs sm:max-w-md p-4 rounded-2xl border text-sm space-y-1.5 ${
                            isMe 
                              ? 'bg-gold/10 border-gold/30 text-white rounded-br-none' 
                              : 'bg-card-bg border-card-border text-gray-300 rounded-bl-none'
                          }`}>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      );
                    })}
                    {aiChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-card-bg border border-card-border p-4 rounded-2xl rounded-bl-none text-gray-400 text-xs flex items-center space-x-2">
                          <span className="h-2 w-2 bg-gold rounded-full animate-bounce"></span>
                          <span className="h-2 w-2 bg-gold rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="h-2 w-2 bg-gold rounded-full animate-bounce [animation-delay:0.4s]"></span>
                          <span>AI Coach is typing...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* AI Input Form */}
                  <form onSubmit={handleSendAIChat} className="p-4 border-t border-card-border bg-[#050507]">
                    <div className="flex items-center space-x-3">
                      <input 
                        type="text" 
                        value={aiChatInput}
                        onChange={(e) => setAiChatInput(e.target.value)}
                        placeholder="Ask AI Coach a question..."
                        className="flex-1 bg-background border border-card-border focus:border-gold/50 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={aiChatLoading || !aiChatInput.trim()}
                        className="gold-gradient-bg text-background px-6 py-3 rounded-xl text-xs font-bold shadow-[0_0_12px_var(--gold-glow)] hover:scale-105 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-1"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Ask AI</span>
                      </button>
                    </div>
                  </form>
                </>
              )}
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
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 border border-green-500/20 text-green-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Approved</span>
                            </span>
                            <button
                              onClick={() => { setSelectedInvoice(order); setShowInvoiceModal(true); }}
                              className="text-xs bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 hover:border-gold px-3 py-1 rounded-full transition-all duration-300 flex items-center space-x-1 font-semibold"
                            >
                              <Printer className="h-3 w-3" />
                              <span>Invoice</span>
                            </button>
                          </div>
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

              {/* Invoice Modal Overlay */}
              {showInvoiceModal && selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fadeIn">
                  <div className="bg-card-bg border border-card-border rounded-3xl max-w-lg w-full p-8 space-y-6 relative">
                    <button 
                      onClick={() => { setShowInvoiceModal(false); setSelectedInvoice(null); }}
                      className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                    
                    {/* Printable Area */}
                    <div id="invoice-print-area" className="space-y-6">
                      <div className="flex justify-between items-start border-b border-card-border pb-4">
                        <div>
                          <h2 className="text-xl font-bold text-white tracking-wide">GNANESWAR_FIT</h2>
                          <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Premium Health & Longevity</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-gold uppercase bg-gold/10 border border-gold/20 px-2.5 py-0.5 rounded">TAX INVOICE</span>
                          <p className="text-[9px] text-gray-500 mt-1">Invoice: #GF-2026-{selectedInvoice.id}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                        <div>
                          <p className="font-semibold text-gray-500 uppercase tracking-wider text-[9px]">BILLED TO</p>
                          <p className="text-white font-bold mt-1">{user?.name}</p>
                          <p className="text-[11px]">{user?.email}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-500 uppercase tracking-wider text-[9px]">PAYMENT DETAILS</p>
                          <p className="mt-1">Date: {new Date(selectedInvoice.created_at).toLocaleDateString()}</p>
                          <p>Status: <span className="text-green-400 font-bold">PAID</span></p>
                          <p>Method: UPI Auto-Gateway</p>
                        </div>
                      </div>

                      {/* Line Item Table */}
                      <div className="border border-card-border rounded-xl overflow-hidden text-xs">
                        <div className="bg-[#050507] grid grid-cols-12 p-3 font-semibold text-gray-400 border-b border-card-border">
                          <div className="col-span-8">Description</div>
                          <div className="col-span-4 text-right">Amount</div>
                        </div>
                        <div className="grid grid-cols-12 p-3 text-white">
                          <div className="col-span-8 font-medium">{selectedInvoice.program?.title || 'Elite Training & Coaching Portal'}</div>
                          <div className="col-span-4 text-right">₹{(selectedInvoice.amount * 0.82).toFixed(2)}</div>
                        </div>
                        <div className="grid grid-cols-12 p-3 text-gray-400 border-t border-card-border bg-[#050507]/50">
                          <div className="col-span-8 text-right font-medium">Subtotal</div>
                          <div className="col-span-4 text-right text-white">₹{(selectedInvoice.amount * 0.82).toFixed(2)}</div>
                        </div>
                        <div className="grid grid-cols-12 p-3 text-gray-400 bg-[#050507]/50">
                          <div className="col-span-8 text-right font-medium">GST (18%)</div>
                          <div className="col-span-4 text-right text-white">₹{(selectedInvoice.amount * 0.18).toFixed(2)}</div>
                        </div>
                        <div className="grid grid-cols-12 p-3 text-gray-400 border-t border-card-border bg-[#050507]">
                          <div className="col-span-8 text-right font-bold text-white">Grand Total</div>
                          <div className="col-span-4 text-right font-black text-gold text-sm">₹{selectedInvoice.amount}</div>
                        </div>
                      </div>
                      
                      <div className="text-[9px] text-gray-500 text-center leading-relaxed">
                        Thank you for building your legacy with Gnaneswar_Fit. This is an electronically generated tax invoice. No physical signature is required.
                      </div>
                    </div>

                    {/* Print / Action Buttons */}
                    <div className="flex gap-4">
                      <button 
                        onClick={() => window.print()}
                        className="flex-1 bg-transparent border border-card-border hover:border-gold text-white hover:text-gold font-bold py-3 rounded-full transition-all duration-300 flex items-center justify-center space-x-2 text-xs"
                      >
                        <Printer className="h-4 w-4" />
                        <span>Print Invoice</span>
                      </button>
                      <button 
                        onClick={() => { setShowInvoiceModal(false); setSelectedInvoice(null); }}
                        className="flex-1 gold-gradient-bg text-background font-bold py-3 rounded-full hover:scale-105 transition-all duration-300 text-xs"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 7: Recovery Hub */}
          {activeTab === 'recovery' && (
            <div className="space-y-8">
              {/* Readiness Score Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-3xl border border-card-border md:col-span-1 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-gold/5 via-transparent to-transparent">
                  <div>
                    <span className="text-[10px] bg-gold/10 border border-gold/20 text-gold px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest">
                      Autonomic Readiness
                    </span>
                    <h3 className="text-3xl font-black text-white mt-4">88/100</h3>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                      Your central nervous system is fully primed. HRV recovery is positive. Push hard in training today.
                    </p>
                  </div>
                  <div className="border-t border-card-border pt-4 mt-6 flex justify-between text-xs text-gray-500">
                    <span>Melatonin Index: Good</span>
                    <span>HRV: 78 ms</span>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-card-border md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-black/30 border border-card-border p-4 rounded-2xl text-center space-y-1">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Sleep Latency</p>
                    <p className="text-xl font-bold text-white">12 mins</p>
                    <p className="text-[9px] text-green-400">Excellent Range</p>
                  </div>
                  <div className="bg-black/30 border border-card-border p-4 rounded-2xl text-center space-y-1">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Resting HR</p>
                    <p className="text-xl font-bold text-white">54 bpm</p>
                    <p className="text-[9px] text-green-400">Vagal Dominant</p>
                  </div>
                  <div className="bg-black/30 border border-card-border p-4 rounded-2xl text-center space-y-1 col-span-2 sm:col-span-1">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Deep Sleep Staging</p>
                    <p className="text-xl font-bold text-white">2.4 hrs</p>
                    <p className="text-[9px] text-gold">28% of total sleep</p>
                  </div>
                </div>
              </div>

              {/* Muscle Soreness & Somatic Reset */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-card-border space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-gold" />
                      <span>Somatic Soreness Logger</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Select body parts experiencing stiffness. The AI synthesizes targeted physical therapy protocols.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-300">
                    <label className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${soreBack ? 'border-gold bg-gold/5' : 'border-card-border hover:border-gray-800'}`}>
                      <input type="checkbox" checked={soreBack} onChange={() => setSoreBack(!soreBack)} className="accent-gold h-4 w-4" />
                      <span>Lower Back / Spine</span>
                    </label>
                    <label className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${soreShoulders ? 'border-gold bg-gold/5' : 'border-card-border hover:border-gray-800'}`}>
                      <input type="checkbox" checked={soreShoulders} onChange={() => setSoreShoulders(!soreShoulders)} className="accent-gold h-4 w-4" />
                      <span>Shoulders / Neck</span>
                    </label>
                    <label className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${soreLegs ? 'border-gold bg-gold/5' : 'border-card-border hover:border-gray-800'}`}>
                      <input type="checkbox" checked={soreLegs} onChange={() => setSoreLegs(!soreLegs)} className="accent-gold h-4 w-4" />
                      <span>Quads / Hamstrings</span>
                    </label>
                    <label className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${soreChest ? 'border-gold bg-gold/5' : 'border-card-border hover:border-gray-800'}`}>
                      <input type="checkbox" checked={soreChest} onChange={() => setSoreChest(!soreChest)} className="accent-gold h-4 w-4" />
                      <span>Chest / Pecs</span>
                    </label>
                    <label className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${soreArms ? 'border-gold bg-gold/5' : 'border-card-border hover:border-gray-800'}`}>
                      <input type="checkbox" checked={soreArms} onChange={() => setSoreArms(!soreArms)} className="accent-gold h-4 w-4" />
                      <span>Biceps / Triceps</span>
                    </label>
                  </div>

                  <button
                    onClick={handleGenerateSomaticReset}
                    className="w-full gold-gradient-bg text-background font-bold py-3 rounded-xl hover:scale-102 transition-all duration-300 text-xs flex items-center justify-center space-x-1.5 shadow-[0_0_10px_var(--gold-glow)]"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Synthesize Recovery Drills</span>
                  </button>
                </div>

                <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-card-border space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">AI Somatic Recovery Program</h4>
                  {somaticRoutine.length === 0 ? (
                    <p className="text-xs text-gray-500">Log soreness indicators to fetch custom recovery drills.</p>
                  ) : (
                    <div className="space-y-3">
                      {somaticRoutine.map((drill, idx) => (
                        <div key={idx} className="bg-black/30 border border-card-border p-4 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <h5 className="font-bold text-white">{drill.name}</h5>
                            <p className="text-[10px] text-gray-500 mt-1">Recommended equipment: {drill.tool}</p>
                          </div>
                          <span className="text-[10px] bg-gold/10 border border-gold/20 text-gold px-2.5 py-0.5 rounded-full font-bold">
                            {drill.duration}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Thermal contrast timer */}
              <div className="glass-panel p-6 rounded-3xl border border-card-border space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Thermal Contrast Therapy Timer</h3>
                  <p className="text-xs text-gray-400 mt-1">Cycle between extreme heat (sauna) and cold shock (ice bath) to speed recovery.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Timer Display */}
                  <div className="bg-[#050507] border border-card-border rounded-2xl p-8 text-center space-y-4">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => { setTimerActive(false); setTimerSecondsLeft(900); setActiveTherapy('sauna'); }}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTherapy === 'sauna' ? 'bg-[#ff6f00]/20 text-[#ff8f00] border border-[#ff6f00]/30' : 'bg-transparent text-gray-500'}`}
                      >
                        Sauna (15m)
                      </button>
                      <button
                        onClick={() => { setTimerActive(false); setTimerSecondsLeft(180); setActiveTherapy('cold'); }}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTherapy === 'cold' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-transparent text-gray-500'}`}
                      >
                        Cold Plunge (3m)
                      </button>
                    </div>

                    <div className="text-5xl font-black font-mono text-white tracking-widest py-4">
                      {Math.floor(timerSecondsLeft / 60).toString().padStart(2, '0')}:
                      {(timerSecondsLeft % 60).toString().padStart(2, '0')}
                    </div>

                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => setTimerActive(!timerActive)}
                        className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${timerActive ? 'bg-red-600 hover:bg-red-700 text-white' : 'gold-gradient-bg text-background shadow-[0_0_10px_var(--gold-glow)]'}`}
                      >
                        {timerActive ? 'Pause' : 'Start Timer'}
                      </button>
                      <button
                        onClick={() => { setTimerActive(false); setTimerSecondsLeft(activeTherapy === 'sauna' ? 900 : 180); }}
                        className="px-6 py-2 bg-transparent border border-card-border hover:border-gold hover:text-gold text-white rounded-full text-xs font-bold transition-all"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Contrast Info/Benefits */}
                  <div className="space-y-4 text-xs leading-relaxed text-gray-300">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contrast Therapy Protocol</h4>
                    <ul className="space-y-2.5 list-disc pl-4 text-gray-400">
                      <li><strong>Vasodilation:</strong> Heat dilates blood vessels, sending nutrient-rich blood deep into tired muscles.</li>
                      <li><strong>Vasoconstriction:</strong> Cold plunge constricts vessels, pushing out metabolic debris and inflammation.</li>
                      <li><strong>Immune Boost:</strong> Induces rapid norepinephrine releases that stimulate immune responses and restore focus.</li>
                      <li>Recommended: 3 cycles of 15m Sauna followed by 3m Cold Plunge.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 8: Gamification Hub */}
          {activeTab === 'gamification' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Top Banner: RPG Avatar & Level */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* RPG Digital Twin Avatar */}
                <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-card-border relative overflow-hidden bg-gradient-to-br from-gold/5 to-transparent">
                  <div className="text-center space-y-4">
                    <span className="text-[10px] bg-gold/10 border border-gold/20 text-gold px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest">
                      Digital Twin RPG Avatar
                    </span>
                    
                    {/* Visual Avatar Placeholder representing character stats */}
                    <div className="h-36 w-36 mx-auto rounded-full bg-[#050507] border-4 border-gold/40 flex items-center justify-center relative shadow-[0_0_20px_rgba(212,175,55,0.15)] animate-pulse">
                      <div className="text-center">
                        <Dumbbell className="h-10 w-10 text-gold mx-auto" />
                        <span className="text-[10px] text-gray-500 font-bold block mt-1">LVL {avatarLevel}</span>
                      </div>
                      
                      {/* Floating level badges */}
                      <span className="absolute -top-1 -right-1 bg-gold text-background text-[10px] px-2 py-0.5 rounded-full font-black">
                        PRO
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white">Elite Athletic Bio-Twin</h3>
                      <p className="text-xs text-gray-500 mt-1">Class: Scientific Muscle Architect</p>
                    </div>

                    {/* Level Progress Bar */}
                    <div className="space-y-1 text-left">
                      <div className="flex justify-between text-[10px] font-bold text-gray-400">
                        <span>Level Progress</span>
                        <span>{avatarXp}/1000 XP</span>
                      </div>
                      <div className="w-full bg-[#050507] h-2.5 rounded-full overflow-hidden border border-card-border">
                        <div 
                          className="gold-gradient-bg h-full rounded-full transition-all duration-500 shadow-[0_0_10px_var(--gold-glow)]"
                          style={{ width: `${(avatarXp / 1000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Avatar Attributes */}
                  <div className="border-t border-card-border pt-4 mt-6 grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-black/20 border border-card-border/50 p-2.5 rounded-xl flex justify-between items-center">
                      <span className="text-gray-500">Strength</span>
                      <span className="text-white font-bold">LVL {avatarLevel + 3}</span>
                    </div>
                    <div className="bg-black/20 border border-card-border/50 p-2.5 rounded-xl flex justify-between items-center">
                      <span className="text-gray-500">Stamina</span>
                      <span className="text-white font-bold">LVL {avatarLevel + 1}</span>
                    </div>
                    <div className="bg-black/20 border border-card-border/50 p-2.5 rounded-xl flex justify-between items-center">
                      <span className="text-gray-500">Consistency</span>
                      <span className="text-white font-bold">LVL {avatarLevel + 2}</span>
                    </div>
                    <div className="bg-black/20 border border-card-border/50 p-2.5 rounded-xl flex justify-between items-center">
                      <span className="text-gray-500">Vagus Sync</span>
                      <span className="text-white font-bold">LVL {avatarLevel}</span>
                    </div>
                  </div>
                </div>

                {/* Commitment Contracts */}
                <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-card-border flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                      <Target className="h-5 w-5 text-gold" />
                      <span>Anti-Sloth Commitment Contracts</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Lock wagers against your goals to maintain high consistency. Complete the contract to double your wagers, or fail and forfeit the pledge.
                    </p>
                  </div>

                  {!contractActive ? (
                    <div className="space-y-4 my-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Weekly Workout Target</label>
                          <select 
                            value={contractTarget} 
                            onChange={(e) => setContractTarget(parseInt(e.target.value))}
                            className="w-full bg-[#050507] border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                          >
                            <option value={3}>3 Workouts</option>
                            <option value={4}>4 Workouts</option>
                            <option value={5}>5 Workouts</option>
                            <option value={6}>6 Workouts</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SweatToken Pledge</label>
                          <select 
                            value={contractPledge} 
                            onChange={(e) => setContractPledge(parseInt(e.target.value))}
                            className="w-full bg-[#050507] border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                          >
                            <option value={25}>25 SweatTokens</option>
                            <option value={50}>50 SweatTokens</option>
                            <option value={100}>100 SweatTokens</option>
                            <option value={150}>150 SweatTokens</option>
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCreateContract(contractTarget, contractPledge)}
                        className="w-full gold-gradient-bg text-background font-bold py-3 rounded-xl hover:scale-102 transition-all duration-300 text-xs shadow-[0_0_10px_var(--gold-glow)]"
                      >
                        Activate Commitment Contract
                      </button>
                    </div>
                  ) : (
                    <div className="bg-black/30 border border-card-border p-5 rounded-2xl space-y-4 my-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[9px] bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold uppercase">
                            ACTIVE CONTRACT
                          </span>
                          <h4 className="font-bold text-white text-sm mt-1">{contractTarget} Workout Weekly Target</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Pledge Pool</p>
                          <p className="text-sm font-black text-gold">{contractPledge} ST</p>
                        </div>
                      </div>

                      {/* Contract Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Weekly Progress</span>
                          <span className="font-bold text-white">{contractProgress} / {contractTarget} Sets</span>
                        </div>
                        <div className="w-full bg-[#050507] h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-green-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${(contractProgress / contractTarget) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="text-[10px] text-gray-500 border-t border-card-border/50 pt-2 leading-relaxed">
                        Log workout sets in the AI Autoregulator tab to increment your contract progress. Reaching targets doubles your staked tokens.
                      </div>
                    </div>
                  )}

                  <div className="border-t border-card-border/50 pt-4 flex items-center space-x-2 text-xs text-gray-500">
                    <span className="bg-gold/10 text-gold px-2 py-0.5 rounded font-bold">Anti-Cheat:</span>
                    <span>All logged workouts are cross-validated against RPE metrics.</span>
                  </div>
                </div>
              </div>

              {/* SweatToken Marketplace & Wallet Ledger */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Wallet Ledger */}
                <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-card-border space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center">
                        <Award className="h-5 w-5 text-gold" />
                      </div>
                      <div>
                        <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">SweatToken Wallet Balance</h4>
                        <p className="text-3xl font-black text-white">{sweatTokens} <span className="text-xs text-gold font-bold">ST</span></p>
                      </div>
                    </div>

                    <div className="border-t border-card-border/50 pt-4 space-y-3">
                      <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Transaction History</h5>
                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {tokenHistory.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[10px] bg-black/25 p-2 rounded-lg border border-card-border/30">
                            <div>
                              <p className="font-bold text-white">{item.desc}</p>
                              <p className="text-[9px] text-gray-500 mt-0.5">{item.date}</p>
                            </div>
                            <span className={item.type === 'earn' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                              {item.type === 'earn' ? '+' : '-'}{item.amount} ST
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/30 border border-card-border p-3.5 rounded-xl text-[10px] text-gray-500 leading-relaxed mt-4">
                    Earn 15 SweatTokens for every training set logged with target RPE, plus 10 tokens for custom biometric recovery sessions.
                  </div>
                </div>

                {/* Marketplace shop */}
                <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-card-border space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Redeem SweatToken Rewards</h3>
                    <p className="text-xs text-gray-400 mt-1">Convert your physical consistency into real-world bio-hacking benefits.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-black/30 border border-card-border p-5 rounded-2xl flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[9px] bg-gold/10 text-gold px-2 py-0.5 rounded font-black uppercase">
                          PDF SWAP
                        </span>
                        <h4 className="font-bold text-white text-sm mt-2">Custom Diet Blueprint Swaps</h4>
                        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                          Unlock a custom vegan/keto meal template with high-protein bioswaps.
                        </p>
                      </div>
                      <div className="flex justify-between items-center border-t border-card-border/50 pt-3">
                        <span className="text-xs font-bold text-gold">25 SweatTokens</span>
                        <button
                          onClick={() => handleRedeemReward("Custom Diet Blueprint Swaps", 25)}
                          className="bg-gold hover:bg-gold-hover text-background font-bold px-4 py-1.5 rounded-lg text-[10px] transition-all"
                        >
                          Redeem
                        </button>
                      </div>
                    </div>

                    <div className="bg-black/30 border border-card-border p-5 rounded-2xl flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[9px] bg-gold/10 text-gold px-2 py-0.5 rounded font-black uppercase">
                          MERCHANDISE
                        </span>
                        <h4 className="font-bold text-white text-sm mt-2">Premium Shaker Bottle</h4>
                        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                          Get a premium insulated stainless steel shaker shipped to your door.
                        </p>
                      </div>
                      <div className="flex justify-between items-center border-t border-card-border/50 pt-3">
                        <span className="text-xs font-bold text-gold">150 SweatTokens</span>
                        <button
                          onClick={() => handleRedeemReward("Premium Shaker Bottle", 150)}
                          className="bg-gold hover:bg-gold-hover text-background font-bold px-4 py-1.5 rounded-lg text-[10px] transition-all"
                        >
                          Redeem
                        </button>
                      </div>
                    </div>

                    <div className="bg-black/30 border border-card-border p-5 rounded-2xl flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[9px] bg-gold/10 text-gold px-2 py-0.5 rounded font-black uppercase">
                          COACHING
                        </span>
                        <h4 className="font-bold text-white text-sm mt-2">1-on-1 Bio-SaaS Strategy Call</h4>
                        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                          A 30-minute consultation call with Coach Gnaneswar to map out your digital twin attributes.
                        </p>
                      </div>
                      <div className="flex justify-between items-center border-t border-card-border/50 pt-3">
                        <span className="text-xs font-bold text-gold={250}">250 SweatTokens</span>
                        <button
                          onClick={() => handleRedeemReward("1-on-1 Bio-SaaS Strategy Call", 250)}
                          className="bg-gold hover:bg-gold-hover text-background font-bold px-4 py-1.5 rounded-lg text-[10px] transition-all"
                        >
                          Redeem
                        </button>
                      </div>
                    </div>

                    <div className="bg-black/30 border border-card-border p-5 rounded-2xl flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[9px] bg-gold/10 text-gold px-2 py-0.5 rounded font-black uppercase">
                          VIDEO AUDIT
                        </span>
                        <h4 className="font-bold text-white text-sm mt-2">Biomechanical Lifting Form Review</h4>
                        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                          Upload 3 videos of squats/deadlifts for direct biomechanics markup & voice feedback.
                        </p>
                      </div>
                      <div className="flex justify-between items-center border-t border-card-border/50 pt-3">
                        <span className="text-xs font-bold text-gold">100 SweatTokens</span>
                        <button
                          onClick={() => handleRedeemReward("Biomechanical Lifting Form Review", 100)}
                          className="bg-gold hover:bg-gold-hover text-background font-bold px-4 py-1.5 rounded-lg text-[10px] transition-all"
                        >
                          Redeem
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
