'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { 
  Users, 
  Check, 
  X, 
  Image as ImageIcon, 
  Edit, 
  Trash, 
  ExternalLink, 
  Dumbbell, 
  ShieldCheck, 
  Tag, 
  Settings, 
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageSquare,
  Paperclip,
  Send,
  Megaphone,
  UploadCloud,
  Lock,
  Plus,
  Play,
  Sparkles
} from 'lucide-react';

const resolveMediaUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const path = url.startsWith('/') ? url : `/${url}`;
  return `http://127.0.0.1:8000${path}`;
};

interface Program {
  id: number;
  title: string;
  description: string;
  price: number;
  type: string;
}

interface ClientUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

interface Order {
  id: number;
  amount: number;
  screenshot_url: string;
  status: string;
  reject_reason?: string;
  created_at: string;
  user?: ClientUser;
  program?: Program;
}

interface PlanTemplate {
  id: number;
  title: string;
  description?: string;
  type: string;
  content: string;
  file_url?: string;
}

interface AssignedPlan {
  id: number;
  user_id: number;
  title: string;
  type: string;
  content: string;
  file_url?: string;
  schedule_type: string;
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

interface MediaFile {
  name: string;
  url: string;
  size: number;
  modified_at: number;
}

interface DailyLog {
  id: number;
  user_id: number;
  date: string;
  workout_completed: boolean;
  meals_completed: number;
  water_intake_ml: number;
  notes?: string;
  weight?: number;
}

export default function AdminDashboard() {
  const { user: authUser, token, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'queue' | 'clients' | 'templates' | 'assignments' | 'chat' | 'announcements' | 'media' | 'cms' | 'transformations'>('queue');
  const [loading, setLoading] = useState(true);

  // Data lists
  const [orders, setOrders] = useState<Order[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [templates, setTemplates] = useState<PlanTemplate[]>([]);
  const [assignments, setAssignments] = useState<AssignedPlan[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  
  // Transformations CMS States
  const [transformationsList, setTransformationsList] = useState<any[]>([]);
  const [transClientName, setTransClientName] = useState('');
  const [transClientAge, setTransClientAge] = useState('');
  const [transClientGoal, setTransClientGoal] = useState('fat loss');
  const [transBeforeWeight, setTransBeforeWeight] = useState('');
  const [transAfterWeight, setTransAfterWeight] = useState('');
  const [transDuration, setTransDuration] = useState('');
  const [transStoryText, setTransStoryText] = useState('');
  const [transBeforeFile, setTransBeforeFile] = useState<File | null>(null);
  const [transAfterFile, setTransAfterFile] = useState<File | null>(null);
  const [transAfterFile2, setTransAfterFile2] = useState<File | null>(null);
  const [transIsSelf, setTransIsSelf] = useState(false);
  const [transSubmitting, setTransSubmitting] = useState(false);
  
  // Selection states
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedClientLogs, setSelectedClientLogs] = useState<DailyLog[]>([]);
  const [selectedClientPlans, setSelectedClientPlans] = useState<AssignedPlan[]>([]);
  
  // Zoom screenshots
  const [zoomScreenshot, setZoomScreenshot] = useState<string | null>(null);

  // Template Form States
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [templateType, setTemplateType] = useState('workout');
  const [templateContent, setTemplateContent] = useState('');
  const [templateFileUrl, setTemplateFileUrl] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);

  // Assignment Form States
  const [assignUserId, setAssignUserId] = useState('');
  const [assignTemplateId, setAssignTemplateId] = useState('');
  const [assignTitle, setAssignTitle] = useState('');
  const [assignContent, setAssignContent] = useState('');
  const [assignType, setAssignType] = useState('workout');
  const [assignFileUrl, setAssignFileUrl] = useState('');
  const [assignSchedule, setAssignSchedule] = useState('daily');

  // Announcement Form States
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');

  // CMS Form States
  const [cmsProgramId, setCmsProgramId] = useState<number | null>(null);
  const [cmsTitle, setCmsTitle] = useState('');
  const [cmsDesc, setCmsDesc] = useState('');
  const [cmsPrice, setCmsPrice] = useState('');
  const [cmsType, setCmsType] = useState('workout');

  // Chat Portal States
  const [chatClientId, setChatClientId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [chatFilePreview, setChatFilePreview] = useState<string | null>(null);
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!authUser) {
        router.push('/login');
      } else if (authUser.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [authUser, authLoading, router]);

  const loadAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Load verifications orders
      const ordersData = await apiFetch('/api/admin/orders', {}, token);
      setOrders(ordersData);

      // Load pricing programs
      const programsData = await apiFetch('/api/programs', {}, token);
      setPrograms(programsData);
      if (programsData.length > 0 && cmsProgramId === null) {
        selectProgramForCMS(programsData[0]);
      }

      // Load clients
      const clientsData = await apiFetch('/api/admin/users', {}, token);
      setClients(clientsData);

      // Load templates
      const templatesData = await apiFetch('/api/templates', {}, token);
      setTemplates(templatesData);

      // Load media library
      const mediaData = await apiFetch('/api/admin/media', {}, token);
      setMediaFiles(mediaData);

      // Load transformations list
      const transData = await apiFetch('/api/transformations');
      setTransformationsList(transData);
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && authUser?.role === 'admin') {
      loadAdminData();
    }
  }, [token, authUser]);

  // Load chat history when selected client changes
  useEffect(() => {
    let chatInterval: any;
    if (activeTab === 'chat' && chatClientId && token) {
      const fetchHistory = async () => {
        try {
          const history = await apiFetch(`/api/chat/history?recipient_id=${chatClientId}`, {}, token);
          setChatMessages(history);

          // Mark read
          await apiFetch(`/api/chat/read?sender_id=${chatClientId}`, { method: 'POST' }, token);
        } catch (err) {
          console.error("Error fetching chat logs:", err);
        }
      };

      fetchHistory();
      chatInterval = setInterval(fetchHistory, 4000);
    }
    return () => clearInterval(chatInterval);
  }, [activeTab, chatClientId, token]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const selectProgramForCMS = (prog: Program) => {
    setCmsProgramId(prog.id);
    setCmsTitle(prog.title);
    setCmsDesc(prog.description || '');
    setCmsPrice(prog.price.toString());
    setCmsType(prog.type);
  };

  const handleApprove = async (orderId: number) => {
    if (!token) return;
    try {
      await apiFetch(`/api/admin/orders/${orderId}/approve`, { method: 'POST' }, token);
      alert("Order approved successfully!");
      loadAdminData();
    } catch (err: any) {
      alert("Approve failed: " + err.message);
    }
  };

  const handleReject = async (orderId: number) => {
    if (!token) return;
    const reason = prompt("Enter payment rejection feedback:");
    if (reason === null) return;
    if (!reason.trim()) {
      alert("Rejection feedback is required.");
      return;
    }
    try {
      await apiFetch(`/api/admin/orders/${orderId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      }, token);
      alert("Order rejected.");
      loadAdminData();
    } catch (err: any) {
      alert("Reject failed: " + err.message);
    }
  };

  const handleCMSUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !cmsProgramId) return;
    try {
      await apiFetch(`/api/admin/content/programs/${cmsProgramId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: cmsTitle,
          description: cmsDesc,
          price: parseFloat(cmsPrice),
          type: cmsType
        })
      }, token);
      alert("Program guide updated successfully!");
      loadAdminData();
    } catch (err: any) {
      alert("Failed to save CMS data: " + err.message);
    }
  };

  const handleToggleUserStatus = async (user_id: number) => {
    if (!token) return;
    try {
      await apiFetch(`/api/admin/users/${user_id}/status`, { method: 'PUT' }, token);
      alert("Client account status updated successfully!");
      loadAdminData();
      if (selectedClientId === user_id) {
        setSelectedClientId(null);
      }
    } catch (err: any) {
      alert("Failed to toggle status: " + err.message);
    }
  };

  const handleClientDetails = async (client: ClientUser) => {
    if (!token) return;
    setSelectedClientId(client.id);
    try {
      const logs = await apiFetch(`/api/logs/client/${client.id}`, {}, token);
      setSelectedClientLogs(logs);
      
      const plans = await apiFetch(`/api/assignments/client/${client.id}`, {}, token);
      setSelectedClientPlans(plans);
    } catch (err: any) {
      console.error("Failed to load client profile details:", err);
    }
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const payload = {
        title: templateTitle,
        description: templateDesc,
        type: templateType,
        content: templateContent,
        file_url: templateFileUrl || null
      };

      if (editingTemplateId) {
        await apiFetch(`/api/templates/${editingTemplateId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        }, token);
        alert("Plan template updated!");
      } else {
        await apiFetch('/api/templates', {
          method: 'POST',
          body: JSON.stringify(payload)
        }, token);
        alert("Template created!");
      }

      setTemplateTitle('');
      setTemplateDesc('');
      setTemplateContent('');
      setTemplateFileUrl('');
      setEditingTemplateId(null);
      loadAdminData();
    } catch (err: any) {
      alert("Failed to save template: " + err.message);
    }
  };

  const handleEditTemplate = (tmpl: PlanTemplate) => {
    setEditingTemplateId(tmpl.id);
    setTemplateTitle(tmpl.title);
    setTemplateDesc(tmpl.description || '');
    setTemplateType(tmpl.type);
    setTemplateContent(tmpl.content);
    setTemplateFileUrl(tmpl.file_url || '');
  };

  const handleDeleteTemplate = async (tmplId: number) => {
    if (!token || !confirm("Are you sure you want to delete this template?")) return;
    try {
      await apiFetch(`/api/templates/${tmplId}`, { method: 'DELETE' }, token);
      alert("Template deleted.");
      loadAdminData();
    } catch (err: any) {
      alert("Delete template failed: " + err.message);
    }
  };

  const handleApplyTemplateToForm = (tmplId: string) => {
    setAssignTemplateId(tmplId);
    const tmpl = templates.find(t => t.id === parseInt(tmplId));
    if (tmpl) {
      setAssignTitle(tmpl.title);
      setAssignContent(tmpl.content);
      setAssignType(tmpl.type);
      setAssignFileUrl(tmpl.file_url || '');
    }
  };

  const handleAssignPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !assignUserId) {
      alert("Please select a client to assign plan.");
      return;
    }
    try {
      await apiFetch('/api/assignments', {
        method: 'POST',
        body: JSON.stringify({
          user_id: parseInt(assignUserId),
          template_id: assignTemplateId ? parseInt(assignTemplateId) : null,
          title: assignTitle,
          content: assignContent,
          type: assignType,
          file_url: assignFileUrl || null,
          schedule_type: assignSchedule
        })
      }, token);
      alert("Plan assigned to client successfully!");
      setAssignUserId('');
      setAssignTemplateId('');
      setAssignTitle('');
      setAssignContent('');
      setAssignFileUrl('');
      loadAdminData();
    } catch (err: any) {
      alert("Assignment failed: " + err.message);
    }
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !announceTitle || !announceContent) return;
    try {
      await apiFetch('/api/announcements', {
        method: 'POST',
        body: JSON.stringify({
          title: announceTitle,
          content: announceContent
        })
      }, token);
      alert("Announcement broadcasted successfully!");
      setAnnounceTitle('');
      setAnnounceContent('');
      loadAdminData();
    } catch (err: any) {
      alert("Failed to broadcast announcement: " + err.message);
    }
  };

  const handleDeleteMedia = async (filename: string) => {
    if (!token || !confirm(`Delete file ${filename} from storage?`)) return;
    try {
      await apiFetch(`/api/admin/media/${filename}`, { method: 'DELETE' }, token);
      alert("File deleted.");
      loadAdminData();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !chatClientId || (!chatInput.trim() && !chatFile)) return;

    setSendingMsg(true);
    const formData = new FormData();
    formData.append('receiver_id', chatClientId.toString());
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

  const handleUnassignPlan = async (planId: number) => {
    if (!token || !confirm("Are you sure you want to unassign this plan?")) return;
    try {
      await apiFetch(`/api/assignments/${planId}`, { method: 'DELETE' }, token);
      alert("Plan unassigned.");
      if (selectedClientId) {
        const plans = await apiFetch(`/api/assignments/client/${selectedClientId}`, {}, token);
        setSelectedClientPlans(plans);
      }
    } catch (err: any) {
      alert("Failed to unassign plan: " + err.message);
    }
  };

  const handleTransformationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !transBeforeFile || !transAfterFile) {
      alert("Please upload both before and after images.");
      return;
    }
    setTransSubmitting(true);
    
    const storyPayload = JSON.stringify({
      client_name: transClientName,
      client_age: transClientAge ? parseInt(transClientAge) : 25,
      client_goal: transClientGoal,
      before_weight: transBeforeWeight,
      after_weight: transAfterWeight,
      duration: transDuration,
      story_text: transStoryText,
      is_self: transIsSelf
    });

    const formData = new FormData();
    formData.append('story', storyPayload);
    formData.append('before_img_file', transBeforeFile);
    formData.append('after_img_file', transAfterFile);
    if (transAfterFile2) {
      formData.append('after_img_file_2', transAfterFile2);
    }
    formData.append('is_public', 'true');

    try {
      await apiFetch('/api/transformations', {
        method: 'POST',
        body: formData
      }, token);
      
      alert("Transformation successfully published!");
      setTransClientName('');
      setTransClientAge('');
      setTransBeforeWeight('');
      setTransAfterWeight('');
      setTransDuration('');
      setTransStoryText('');
      setTransBeforeFile(null);
      setTransAfterFile(null);
      setTransAfterFile2(null);
      setTransIsSelf(false);
      
      await loadAdminData();
    } catch (err: any) {
      alert("Failed to submit transformation: " + err.message);
    } finally {
      setTransSubmitting(false);
    }
  };

  const handleDeleteTransformation = async (transId: number) => {
    if (!token || !confirm("Are you sure you want to delete this success story transformation?")) return;
    try {
      await apiFetch(`/api/transformations/${transId}`, { method: 'DELETE' }, token);
      alert("Transformation deleted successfully.");
      await loadAdminData();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Dumbbell className="h-12 w-12 text-gold animate-spin" />
      </div>
    );
  }

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Welcome Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-card-border mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
            <ShieldCheck className="h-8 w-8 text-gold animate-pulse" />
            <span>Admin Control Room</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Review user payment uploads and configure program prices and site content.</p>
        </div>
        <div className="bg-[#050507] border border-card-border px-5 py-3 rounded-2xl flex items-center space-x-3">
          <Users className="h-6 w-6 text-gold" />
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Total Clients</p>
            <p className="text-white font-bold text-xs">{clients.length} Registered</p>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-2">
          <button 
            onClick={() => setActiveTab('queue')}
            className={`w-full text-left px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
              activeTab === 'queue' ? 'bg-gold text-background shadow-[0_0_12px_var(--gold-glow)]' : 'bg-card-bg text-gray-300 border border-card-border hover:border-gold/50'
            }`}
          >
            <span>Verification Queue</span>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[9px] h-5 w-5 rounded-full flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('clients')}
            className={`w-full text-left px-5 py-3.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 ${
              activeTab === 'clients' ? 'bg-gold text-background shadow-[0_0_12px_var(--gold-glow)]' : 'bg-card-bg text-gray-300 border border-card-border hover:border-gold/50'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Clients Directory</span>
          </button>

          <button 
            onClick={() => setActiveTab('templates')}
            className={`w-full text-left px-5 py-3.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 ${
              activeTab === 'templates' ? 'bg-gold text-background shadow-[0_0_12px_var(--gold-glow)]' : 'bg-card-bg text-gray-300 border border-card-border hover:border-gold/50'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Plan Templates</span>
          </button>

          <button 
            onClick={() => setActiveTab('assignments')}
            className={`w-full text-left px-5 py-3.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 ${
              activeTab === 'assignments' ? 'bg-gold text-background shadow-[0_0_12px_var(--gold-glow)]' : 'bg-card-bg text-gray-300 border border-card-border hover:border-gold/50'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Assign Programs</span>
          </button>

          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full text-left px-5 py-3.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 ${
              activeTab === 'chat' ? 'bg-gold text-background shadow-[0_0_12px_var(--gold-glow)]' : 'bg-card-bg text-gray-300 border border-card-border hover:border-gold/50'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Chat Room</span>
          </button>

          <button 
            onClick={() => setActiveTab('announcements')}
            className={`w-full text-left px-5 py-3.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 ${
              activeTab === 'announcements' ? 'bg-gold text-background shadow-[0_0_12px_var(--gold-glow)]' : 'bg-card-bg text-gray-300 border border-card-border hover:border-gold/50'
            }`}
          >
            <Megaphone className="h-4 w-4" />
            <span>Broadcast Feed</span>
          </button>

          <button 
            onClick={() => setActiveTab('media')}
            className={`w-full text-left px-5 py-3.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 ${
              activeTab === 'media' ? 'bg-gold text-background shadow-[0_0_12px_var(--gold-glow)]' : 'bg-card-bg text-gray-300 border border-card-border hover:border-gold/50'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Media Assets</span>
          </button>

          <button 
            onClick={() => setActiveTab('cms')}
            className={`w-full text-left px-5 py-3.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 ${
              activeTab === 'cms' ? 'bg-gold text-background shadow-[0_0_12px_var(--gold-glow)]' : 'bg-card-bg text-gray-300 border border-card-border hover:border-gold/50'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Coaching Catalog CMS</span>
          </button>

          <button 
            onClick={() => setActiveTab('transformations')}
            className={`w-full text-left px-5 py-3.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 ${
              activeTab === 'transformations' ? 'bg-gold text-background shadow-[0_0_12px_var(--gold-glow)]' : 'bg-card-bg text-gray-300 border border-card-border hover:border-gold/50'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Transformations CMS</span>
          </button>
        </div>

        {/* Dynamic Panels */}
        <div className="lg:col-span-9">
          
          {/* Tab 1: Verification Queue */}
          {activeTab === 'queue' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Review Payments Queue</h2>
              {orders.length === 0 ? (
                <div className="glass-panel p-10 rounded-3xl border border-card-border text-center text-gray-400">
                  No orders have been submitted on this platform yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-card-border">
                  <table className="min-w-full divide-y divide-card-border bg-card-bg/60 backdrop-blur text-sm">
                    <thead>
                      <tr className="text-gray-400 text-xs font-bold text-left bg-background/80">
                        <th className="px-6 py-4">Client Detail</th>
                        <th className="px-6 py-4">Selected Plan</th>
                        <th className="px-6 py-4 text-center">Amount</th>
                        <th className="px-6 py-4 text-center">Payment Proof</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-card-bg/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-white">{order.user?.name}</p>
                            <p className="text-xs text-gray-400">{order.user?.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-white">{order.program?.title}</p>
                            <p className="text-xs text-gray-500 capitalize">{order.program?.type}</p>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-white">₹{order.amount}</td>
                          <td className="px-6 py-4 text-center">
                            {order.screenshot_url ? (
                              <button 
                                onClick={() => setZoomScreenshot(order.screenshot_url)}
                                className="text-gold hover:underline text-xs flex items-center space-x-1 justify-center mx-auto"
                              >
                                <ImageIcon className="h-4 w-4" />
                                <span>View Receipt</span>
                              </button>
                            ) : (
                              <span className="text-gray-600">No Image</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                              order.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              order.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            {order.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleApprove(order.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded-full hover:scale-105 transition-all"
                                  title="Approve Order"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleReject(order.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full hover:scale-105 transition-all"
                                  title="Reject Order"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Clients Directory */}
          {activeTab === 'clients' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Client List */}
              <div className="lg:col-span-6 space-y-4">
                <h2 className="text-xl font-bold text-white mb-2">Registered Clients</h2>
                
                {clients.length === 0 ? (
                  <div className="glass-panel p-8 text-center text-gray-400 text-sm">
                    No clients registered in this portal yet.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {clients.map(client => (
                      <div 
                        key={client.id}
                        onClick={() => handleClientDetails(client)}
                        className={`glass-panel p-5 rounded-2xl border cursor-pointer transition-all ${
                          selectedClientId === client.id 
                            ? 'border-gold bg-gold/5 shadow-[0_0_12px_var(--gold-glow)]' 
                            : 'border-card-border hover:border-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-white text-sm">{client.name}</h4>
                            <p className="text-xs text-gray-400">{client.email}</p>
                            <p className="text-[10px] text-gray-500 mt-1">Registered: {new Date(client.created_at).toLocaleDateString()}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              client.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {client.is_active ? 'Active' : 'Suspended'}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleUserStatus(client.id);
                              }}
                              className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
                                client.is_active 
                                  ? 'border-red-500/20 hover:border-red-500 text-red-400 hover:bg-red-500/5' 
                                  : 'border-green-500/20 hover:border-green-500 text-green-400 hover:bg-green-500/5'
                              }`}
                            >
                              {client.is_active ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Client Profile Details Panel */}
              <div className="lg:col-span-6">
                <h2 className="text-xl font-bold text-white mb-2">Client Details & Progress</h2>
                
                {selectedClientId === null ? (
                  <div className="glass-panel p-10 rounded-3xl border border-card-border text-center text-gray-400 text-sm">
                    Select a client from the directory list to examine their physical weight histories, weekly log check-ins, and active program assignments.
                  </div>
                ) : (
                  <div className="glass-panel p-6 rounded-3xl border border-card-border space-y-6">
                    {/* Header profile info */}
                    {clients.filter(c => c.id === selectedClientId).map(client => (
                      <div key={client.id} className="border-b border-card-border pb-4 flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-bold text-gold">{client.name}</h3>
                          <p className="text-xs text-gray-400">{client.email} | {client.phone || 'No phone'}</p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab('chat');
                            setChatClientId(client.id);
                          }}
                          className="px-4 py-2 bg-gold text-background rounded-full text-xs font-bold hover:scale-105 transition-all flex items-center space-x-1.5"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Chat Room</span>
                        </button>
                      </div>
                    ))}

                    {/* Active Assigned Plans */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Assigned Plans</h4>
                      {selectedClientPlans.length === 0 ? (
                        <p className="text-xs text-gray-500">No custom programs assigned to this client yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedClientPlans.map(plan => (
                            <div key={plan.id} className="flex justify-between items-center bg-[#050507] border border-card-border p-3 rounded-xl text-xs">
                              <div>
                                <p className="font-bold text-white">{plan.title}</p>
                                <p className="text-[10px] text-gray-400 capitalize">{plan.type} template</p>
                              </div>
                              <button 
                                onClick={() => handleUnassignPlan(plan.id)}
                                className="text-red-500 hover:text-red-400 font-bold"
                              >
                                Unassign
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Scale Weight Log Check-ins */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Daily Log Metrics & Notes</h4>
                      {selectedClientLogs.length === 0 ? (
                        <p className="text-xs text-gray-500">No daily logs recorded by this user yet.</p>
                      ) : (
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {selectedClientLogs.map(log => (
                            <div key={log.id} className="bg-black/40 border border-card-border p-3.5 rounded-xl space-y-1 text-xs">
                              <div className="flex justify-between items-center text-[10px] text-gray-500">
                                <span>{log.date}</span>
                                <span className={log.workout_completed ? 'text-green-400 font-bold' : 'text-gray-600'}>
                                  {log.workout_completed ? 'Workout Done' : 'No Workout'}
                                </span>
                              </div>
                              <p className="text-white font-bold">Weight: {log.weight ? `${log.weight} kg` : 'Not recorded'}</p>
                              <p className="text-gray-400 text-[10px]">Meals: {log.meals_completed} | Water: {log.water_intake_ml}ml</p>
                              {log.notes && <p className="text-gold text-[10px] italic mt-1">Notes: "{log.notes}"</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}

          {/* Tab 3: Plan Templates Builder */}
          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form panel */}
              <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-card-border">
                <h3 className="text-lg font-bold text-white mb-4">
                  {editingTemplateId ? 'Edit Plan Template' : 'Create New Template'}
                </h3>
                
                <form onSubmit={handleTemplateSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Template Title</label>
                    <input 
                      type="text"
                      required
                      value={templateTitle}
                      onChange={(e) => setTemplateTitle(e.target.value)}
                      placeholder="e.g. 5x5 Strength Block"
                      className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Brief Description</label>
                    <input 
                      type="text"
                      value={templateDesc}
                      onChange={(e) => setTemplateDesc(e.target.value)}
                      placeholder="e.g. Barbell focus progression"
                      className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Template Type</label>
                      <select 
                        value={templateType}
                        onChange={(e) => setTemplateType(e.target.value)}
                        className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                      >
                        <option value="workout">Workout Plan</option>
                        <option value="diet">Diet & Meals</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Attached File URL (optional)</label>
                      <input 
                        type="text"
                        value={templateFileUrl}
                        onChange={(e) => setTemplateFileUrl(e.target.value)}
                        placeholder="e.g. /uploads/guide.pdf"
                        className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Template Routine Content (Markdown/Text)</label>
                    <textarea 
                      rows={6}
                      required
                      value={templateContent}
                      onChange={(e) => setTemplateContent(e.target.value)}
                      placeholder="Enter exercises details..."
                      className="w-full bg-background border border-card-border rounded-xl p-4 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button 
                      type="submit"
                      className="w-full gold-gradient-bg text-background font-bold py-2.5 rounded-full text-xs"
                    >
                      {editingTemplateId ? 'Save Changes' : 'Create Template'}
                    </button>
                    {editingTemplateId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingTemplateId(null);
                          setTemplateTitle('');
                          setTemplateDesc('');
                          setTemplateContent('');
                          setTemplateFileUrl('');
                        }}
                        className="bg-transparent border border-card-border text-white px-5 rounded-full text-xs"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Templates List */}
              <div className="lg:col-span-7 space-y-4">
                <h2 className="text-xl font-bold text-white mb-2">Saved Plan Templates</h2>
                
                {templates.length === 0 ? (
                  <div className="glass-panel p-8 text-center text-gray-400 text-sm">
                    No plan templates created yet. Use form on left to create templates.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {templates.map(tmpl => (
                      <div key={tmpl.id} className="glass-panel p-5 rounded-xl border border-card-border space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white text-sm">{tmpl.title}</h4>
                            <p className="text-xs text-gray-400 mt-0.5 capitalize">{tmpl.type} blueprint | {tmpl.description || 'No description'}</p>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditTemplate(tmpl)}
                              className="text-xs text-gold border border-gold/10 hover:border-gold p-1.5 rounded-lg"
                              title="Edit Template"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteTemplate(tmpl.id)}
                              className="text-xs text-red-500 border border-red-500/10 hover:border-red-500 p-1.5 rounded-lg"
                              title="Delete Template"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-500 truncate bg-black/40 p-2 rounded font-mono">{tmpl.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Tab 4: Program Assignment Manager */}
          {activeTab === 'assignments' && (
            <div className="glass-panel p-8 rounded-3xl border border-card-border max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-white mb-6">Assign Custom Plan to Client</h2>
              
              <form onSubmit={handleAssignPlanSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Select Client */}
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 block font-semibold">1. Select Target Client</label>
                    <select 
                      required
                      value={assignUserId}
                      onChange={(e) => setAssignUserId(e.target.value)}
                      className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    >
                      <option value="">-- Choose Client --</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Template Optional */}
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 block font-semibold">2. Choose Template (optional)</label>
                    <select 
                      value={assignTemplateId}
                      onChange={(e) => handleApplyTemplateToForm(e.target.value)}
                      className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    >
                      <option value="">-- Custom Plan (No Template) --</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.title} ({t.type})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t border-card-border/50 pt-4 space-y-4">
                  <h3 className="text-sm font-bold text-gold">Plan Assignment Details</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Plan Title</label>
                      <input 
                        type="text"
                        required
                        value={assignTitle}
                        onChange={(e) => setAssignTitle(e.target.value)}
                        placeholder="e.g. Day 1 Leg hypertrophy"
                        className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Plan Type</label>
                      <select 
                        value={assignType}
                        onChange={(e) => setAssignType(e.target.value)}
                        className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                      >
                        <option value="workout">Workout Routine</option>
                        <option value="diet">Diet & Meals Plan</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Schedule Type</label>
                      <select 
                        value={assignSchedule}
                        onChange={(e) => setAssignSchedule(e.target.value)}
                        className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                      >
                        <option value="daily">Daily Update</option>
                        <option value="weekly">Weekly Update</option>
                        <option value="monthly">Monthly Update</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Optional PDF Guide Link</label>
                    <input 
                      type="text"
                      value={assignFileUrl}
                      onChange={(e) => setAssignFileUrl(e.target.value)}
                      placeholder="e.g. /uploads/legs_workout.pdf"
                      className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Personalized Content Details</label>
                    <textarea 
                      rows={6}
                      required
                      value={assignContent}
                      onChange={(e) => setAssignContent(e.target.value)}
                      placeholder="Describe exercises, reps, sets, or macros in detail..."
                      className="w-full bg-background border border-card-border rounded-xl p-4 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full gold-gradient-bg text-background font-bold py-3.5 rounded-full text-sm"
                >
                  Confirm Plan Assignment
                </button>
              </form>
            </div>
          )}

          {/* Tab 5: Chat Portal Selector */}
          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Clients selector list */}
              <div className="lg:col-span-4 space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Active Conversations</h3>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {clients.length === 0 ? (
                    <div className="text-gray-500 text-xs py-5 text-center border border-card-border/40 rounded-xl bg-card-bg/20">
                      No client accounts registered to chat with.
                    </div>
                  ) : (
                    clients.map(c => (
                      <div 
                        key={c.id}
                        onClick={() => setChatClientId(c.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          chatClientId === c.id 
                            ? 'border-gold bg-gold/5 shadow-[0_0_8px_var(--gold-glow)]' 
                            : 'border-card-border hover:border-gray-700 bg-card-bg/40'
                        }`}
                      >
                        <p className="font-bold text-white text-xs">{c.name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{c.email}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat room messages */}
              <div className="lg:col-span-8">
                {chatClientId === null ? (
                  <div className="glass-panel p-16 rounded-3xl border border-card-border text-center text-gray-400 text-sm">
                    Select a client conversation from list to view history logs and reply.
                  </div>
                ) : (
                  <div className="glass-panel rounded-3xl border border-card-border h-[500px] flex flex-col overflow-hidden">
                    <div className="border-b border-card-border p-4 bg-[#050507] flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-bold text-white">{clients.find(c => c.id === chatClientId)?.name}</h4>
                        <p className="text-[9px] text-gray-500">Private Coaching Conversation</p>
                      </div>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-background/20">
                      {chatMessages.map(msg => {
                        const isMe = msg.sender_id === authUser?.id;
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs sm:max-w-md p-3.5 rounded-xl border text-xs ${
                              isMe ? 'bg-gold/10 border-gold/30 text-white rounded-br-none' : 'bg-card-bg border-card-border text-gray-300 rounded-bl-none'
                            }`}>
                              {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                              {msg.file_url && (
                                <div className="mt-1 pt-1.5 border-t border-white/10">
                                  {msg.file_type === 'image' ? (
                                    <img src={resolveMediaUrl(msg.file_url)} alt="Attachment" className="max-h-40 rounded" />
                                  ) : (
                                    <a href={resolveMediaUrl(msg.file_url)} target="_blank" rel="noreferrer" className="text-[10px] text-gold hover:underline">
                                      View Attachment
                                    </a>
                                  )}
                                </div>
                              )}
                              <p className="text-[8px] text-gray-500 text-right mt-1">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatBottomRef} />
                    </div>

                    <form onSubmit={handleSendChatMessage} className="p-3 border-t border-card-border bg-[#050507]">
                      {chatFilePreview && (
                        <div className="relative inline-block mt-1">
                          <img src={chatFilePreview} alt="Preview" className="h-10 w-10 object-cover rounded border border-card-border" />
                          <button 
                            type="button" 
                            onClick={() => { setChatFile(null); setChatFilePreview(null); }}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 text-[8px] hover:bg-red-600"
                          >
                            <X className="h-2 w-2" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <label className="cursor-pointer text-gray-400 hover:text-gold transition-colors p-1.5 rounded-full hover:bg-white/5">
                          <Paperclip className="h-4 w-4" />
                          <input type="file" accept="image/*, application/pdf" onChange={handleChatFileChange} className="hidden" />
                        </label>
                        <input 
                          type="text" 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Type reply to client..."
                          className="flex-1 bg-background border border-card-border focus:border-gold/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        />
                        <button type="submit" disabled={sendingMsg} className="gold-gradient-bg text-background p-2.5 rounded-xl disabled:opacity-50">
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 6: Broadcast Announcements */}
          {activeTab === 'announcements' && (
            <div className="glass-panel p-8 rounded-3xl border border-card-border max-w-xl mx-auto">
              <h2 className="text-xl font-bold text-white mb-6">Broadcast New Announcement</h2>
              
              <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Announcement Title</label>
                  <input 
                    type="text"
                    required
                    value={announceTitle}
                    onChange={(e) => setAnnounceTitle(e.target.value)}
                    placeholder="e.g. Week 4 Check-ins Open"
                    className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Announcement Content</label>
                  <textarea 
                    rows={5}
                    required
                    value={announceContent}
                    onChange={(e) => setAnnounceContent(e.target.value)}
                    placeholder="Type details for all clients to read on their dashboard feeds..."
                    className="w-full bg-background border border-card-border rounded-xl p-4 text-xs text-white focus:outline-none leading-relaxed"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full gold-gradient-bg text-background font-bold py-3 rounded-full text-sm flex items-center justify-center space-x-1.5"
                >
                  <Megaphone className="h-4 w-4" />
                  <span>Post Broadcast Announcement</span>
                </button>
              </form>
            </div>
          )}

          {/* Tab 7: Media Assets Library */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Central Media Assets</h2>
              
              {mediaFiles.length === 0 ? (
                <div className="glass-panel p-10 rounded-3xl border border-card-border text-center text-gray-400 text-sm">
                  No files uploaded to the media directory yet. User receipts and uploaded screenshots appear here.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mediaFiles.map((file) => {
                    const isImg = file.name.match(/\.(jpg|jpeg|png|gif)$/i);
                    return (
                      <div key={file.name} className="glass-panel p-4 rounded-xl border border-card-border flex flex-col justify-between h-44 relative group">
                        {isImg ? (
                          <div className="h-24 w-full rounded-lg overflow-hidden bg-black/40">
                            <img src={resolveMediaUrl(file.url)} alt="Media Asset" className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-24 w-full rounded-lg bg-black/40 flex items-center justify-center text-gold">
                            <FileText className="h-8 w-8" />
                          </div>
                        )}
                        
                        <div className="pt-2 flex justify-between items-center text-[10px]">
                          <span className="text-gray-400 truncate w-3/4">{file.name}</span>
                          <button 
                            onClick={() => handleDeleteMedia(file.name)}
                            className="text-red-500 hover:text-red-400"
                            title="Delete file"
                          >
                            <Trash className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 8: Coaching Catalog CMS */}
          {activeTab === 'cms' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Selector List */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="text-lg font-bold text-white mb-2">Program Catalog</h3>
                <div className="space-y-2">
                  {programs.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectProgramForCMS(item)}
                      className={`w-full text-left p-4 rounded-xl border transition-all text-xs font-bold ${
                        cmsProgramId === item.id 
                          ? 'border-gold bg-gold/5 text-gold' 
                          : 'border-card-border bg-card-bg/40 text-gray-300'
                      }`}
                    >
                      <p className="truncate">{item.title}</p>
                      <p className="text-[10px] text-gray-500 font-semibold mt-1 capitalize">₹{item.price} | {item.type}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Editor */}
              <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-card-border">
                <h3 className="text-lg font-bold text-white mb-4">Edit Catalog Details</h3>
                
                <form onSubmit={handleCMSUpdate} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Program Title</label>
                    <input 
                      type="text" 
                      required
                      value={cmsTitle}
                      onChange={(e) => setCmsTitle(e.target.value)}
                      className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Program Price (INR)</label>
                    <input 
                      type="number" 
                      required
                      value={cmsPrice}
                      onChange={(e) => setCmsPrice(e.target.value)}
                      className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Category / Type</label>
                    <select 
                      value={cmsType}
                      onChange={(e) => setCmsType(e.target.value)}
                      className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    >
                      <option value="workout">Workout blueprint only</option>
                      <option value="diet">Nutrition diet only</option>
                      <option value="both">Both Workout & Diet</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Catalog Description</label>
                    <textarea 
                      rows={4}
                      required
                      value={cmsDesc}
                      onChange={(e) => setCmsDesc(e.target.value)}
                      className="w-full bg-background border border-card-border rounded-xl p-4 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full gold-gradient-bg text-background font-bold py-3 rounded-full text-xs"
                  >
                    Save Catalog Details
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Tab 9: Transformations CMS */}
          {activeTab === 'transformations' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Upload */}
              <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-card-border">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-gold" />
                  <span>Publish Transformation</span>
                </h3>
                
                <form onSubmit={handleTransformationSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Client Name</label>
                    <input 
                      type="text" 
                      required
                      value={transClientName}
                      onChange={(e) => setTransClientName(e.target.value)}
                      placeholder="e.g. Alex Jenkins"
                      className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Client Age</label>
                      <input 
                        type="number" 
                        required
                        value={transClientAge}
                        onChange={(e) => setTransClientAge(e.target.value)}
                        placeholder="e.g. 28"
                        className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Fitness Goal</label>
                      <select 
                        value={transClientGoal}
                        onChange={(e) => setTransClientGoal(e.target.value)}
                        className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                      >
                        <option value="fat loss">Fat Loss</option>
                        <option value="muscle gain">Muscle Gain</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Before Weight</label>
                      <input 
                        type="text" 
                        required
                        value={transBeforeWeight}
                        onChange={(e) => setTransBeforeWeight(e.target.value)}
                        placeholder="e.g. 92 kg"
                        className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">After Weight</label>
                      <input 
                        type="text" 
                        required
                        value={transAfterWeight}
                        onChange={(e) => setTransAfterWeight(e.target.value)}
                        placeholder="e.g. 77 kg"
                        className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-400">Duration</label>
                      <input 
                        type="text" 
                        required
                        value={transDuration}
                        onChange={(e) => setTransDuration(e.target.value)}
                        placeholder="e.g. 12 Weeks"
                        className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 block">Before Image Upload</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      required
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setTransBeforeFile(e.target.files[0]);
                        }
                      }}
                      className="text-xs text-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 block">After Image Upload (Main/Front)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      required
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setTransAfterFile(e.target.files[0]);
                        }
                      }}
                      className="text-xs text-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 block">After Image Upload 2 (Optional - e.g. Side Flex)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setTransAfterFile2(e.target.files[0]);
                        }
                      }}
                      className="text-xs text-gray-300"
                    />
                  </div>

                  <div className="flex items-center space-x-2 py-2">
                    <input 
                      type="checkbox"
                      id="transIsSelf"
                      checked={transIsSelf}
                      onChange={(e) => setTransIsSelf(e.target.checked)}
                      className="rounded border-card-border text-gold bg-background focus:ring-0 focus:ring-offset-0 h-4 w-4"
                    />
                    <label htmlFor="transIsSelf" className="text-xs font-bold text-white cursor-pointer select-none">
                      👑 Coach Self-Transformation Proof (Shows in top block)
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Success Story Description</label>
                    <textarea 
                      rows={4}
                      required
                      value={transStoryText}
                      onChange={(e) => setTransStoryText(e.target.value)}
                      placeholder="e.g. Sarah added 4kg of pure lean mass and hit new personal records..."
                      className="w-full bg-background border border-card-border rounded-xl p-4 text-xs text-white focus:outline-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={transSubmitting}
                    className="w-full gold-gradient-bg text-background font-bold py-3.5 rounded-full text-xs flex items-center justify-center space-x-1.5"
                  >
                    <span>{transSubmitting ? 'Uploading photos...' : 'Publish Success Story'}</span>
                  </button>
                </form>
              </div>

              {/* Transformations List */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-xl font-bold text-white mb-2">Active Transformations CMS</h3>
                
                {transformationsList.length === 0 ? (
                  <div className="glass-panel p-8 text-center text-gray-400 text-sm">
                    No custom transformations uploaded to the server yet.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                    {transformationsList.map((item) => {
                      let clientName = "Success Story";
                      let storyText = item.story;
                      let goal = "fat loss";
                      let isSelf = false;
                      
                      if (item.story && item.story.trim().startsWith('{')) {
                        try {
                          const parsed = JSON.parse(item.story);
                          clientName = parsed.client_name || clientName;
                          storyText = parsed.story_text || storyText;
                          goal = parsed.client_goal || goal;
                          isSelf = !!parsed.is_self;
                        } catch {}
                      }

                      return (
                        <div key={item.id} className="glass-panel p-5 rounded-2xl border border-card-border flex gap-4 justify-between items-start">
                          <div className="flex gap-4 items-center">
                            <div className="flex -space-x-4">
                              <img src={`http://127.0.0.1:8000${item.before_img}`} alt="Before" className="h-14 w-14 object-cover rounded-full border border-card-border" />
                              <img src={`http://127.0.0.1:8000${item.after_img}`} alt="After" className="h-14 w-14 object-cover rounded-full border border-gold/40" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-bold text-white text-sm">{clientName}</h4>
                                {isSelf && (
                                  <span className="bg-gold/10 text-gold border border-gold/20 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Coach Self</span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-400 capitalize mt-0.5">{goal} goal | ID: #{item.id}</p>
                              <p className="text-[10px] text-gray-500 line-clamp-2 mt-1">{storyText}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteTransformation(item.id)}
                            className="text-red-500 hover:text-red-400 p-2 border border-red-500/10 hover:border-red-500 rounded-lg transition-colors"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Screenshot Zoom Modal */}
      {zoomScreenshot && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button 
              onClick={() => setZoomScreenshot(null)}
              className="absolute -top-10 right-0 text-white hover:text-gold font-bold text-sm bg-black/50 p-2 rounded-full"
            >
              ✕ Close Receipt
            </button>
            <img src={resolveMediaUrl(zoomScreenshot)} alt="Receipt Zoom" className="max-h-[80vh] rounded-lg object-contain mx-auto" />
          </div>
        </div>
      )}

    </div>
  );
}
