'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { apiFetch, resolveMediaUrl } from '@/lib/api';
import { 
  Users, 
  Check, 
  X, 
  Image as ImageIcon, 
  Edit, 
  Trash2, 
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
  Sparkles,
  LayoutDashboard,
  Film,
  Globe,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  body: string;
  cover_img?: string;
  category?: string;
  tags?: string;
  author?: string;
  is_published: boolean;
  published_at: string;
}

interface ClientTransformation {
  id: number;
  client_name: string;
  before_img: string;
  after_img: string;
  video_url?: string;
  story: string;
  duration?: string;
  before_weight?: string;
  after_weight?: string;
  goal?: string;
  is_published: boolean;
}

interface MyTransformation {
  id: number;
  title: string;
  story: string;
  before_img: string;
  after_img: string;
  after_img_2?: string;
  video_url?: string;
  duration?: string;
  before_weight?: string;
  after_weight?: string;
  category?: string;
  is_published: boolean;
}

interface TransformationVideo {
  id: number;
  title: string;
  description?: string;
  client_name?: string;
  thumbnail_url?: string;
  video_url: string;
  is_published: boolean;
}

interface MediaFile {
  name: string;
  url: string;
  size: number;
  modified_at: number;
}

export default function AdminDashboard() {
  const { user, token, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  // Selected Dashboard Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'blogs' | 'client-transformations' | 'my-transformations' | 'videos' | 'media' | 'chat' | 'settings' | 'orders' | 'clients'
  >('overview');

  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Data lists
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [clientTrans, setClientTrans] = useState<ClientTransformation[]>([]);
  const [myTrans, setMyTrans] = useState<MyTransformation[]>([]);
  const [videos, setVideos] = useState<TransformationVideo[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [websiteSettings, setWebsiteSettings] = useState<Record<string, string>>({});
  const [orders, setOrders] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  // Chat tab state
  const [selectedChatClient, setSelectedChatClient] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatText, setChatText] = useState('');
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSearch, setChatSearch] = useState('');

  // Confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Blog Form Modal State
  const [blogModal, setBlogModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; item?: BlogPost }>({
    isOpen: false,
    mode: 'create'
  });
  const [blogForm, setBlogForm] = useState({
    title: '',
    body: '',
    category: 'Training',
    tags: 'fitness,nutrition',
    author: 'Gnaneswar Kokkirala',
    is_published: true,
    cover_img_url: '',
    cover_file: null as File | null
  });

  // Client Transformation Form Modal State
  const [clientTransModal, setClientTransModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; item?: ClientTransformation }>({
    isOpen: false,
    mode: 'create'
  });
  const [clientTransForm, setClientTransForm] = useState({
    client_name: '',
    story: '',
    duration: '12 Weeks',
    before_weight: '',
    after_weight: '',
    goal: 'fat loss',
    is_published: true,
    before_img_url: '',
    after_img_url: '',
    video_url: '',
    before_file: null as File | null,
    after_file: null as File | null,
    video_file: null as File | null
  });

  // My Transformation Form Modal State
  const [myTransModal, setMyTransModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; item?: MyTransformation }>({
    isOpen: false,
    mode: 'create'
  });
  const [myTransForm, setMyTransForm] = useState({
    title: 'Personal Contest Transformation',
    story: '',
    duration: '24 Weeks',
    before_weight: '60 kg',
    after_weight: '70 kg',
    category: 'Bodybuilding Prep',
    is_published: true,
    before_img_url: '',
    after_img_url: '',
    after_img_2_url: '',
    video_url: '',
    before_file: null as File | null,
    after_file: null as File | null,
    after_file_2: null as File | null,
    video_file: null as File | null
  });

  // Video Form Modal State
  const [videoModal, setVideoModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; item?: TransformationVideo }>({
    isOpen: false,
    mode: 'create'
  });
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    client_name: '',
    is_published: true,
    video_url: '',
    thumbnail_url: '',
    video_file: null as File | null,
    thumbnail_file: null as File | null
  });

  // Media Library Upload State
  const [mediaUploadFile, setMediaUploadFile] = useState<File | null>(null);
  const [mediaSearch, setMediaSearch] = useState('');

  // Media Picker Modal State (to select from Media Library into form)
  const [mediaPicker, setMediaPicker] = useState<{
    isOpen: boolean;
    onSelect: (url: string) => void;
  }>({ isOpen: false, onSelect: () => {} });

  const showToast = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Auth Protection Check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch all admin data
  const refreshAllData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [bData, cData, mData, vData, medData, settData, oData, clData] = await Promise.all([
        apiFetch('/api/blogs?all_records=true', {}, token).catch(() => []),
        apiFetch('/api/client-transformations?all_records=true', {}, token).catch(() => []),
        apiFetch('/api/my-transformations?all_records=true', {}, token).catch(() => []),
        apiFetch('/api/transformation-videos?all_records=true', {}, token).catch(() => []),
        apiFetch('/api/admin/media', {}, token).catch(() => []),
        apiFetch('/api/settings', {}, token).catch(() => ({})),
        apiFetch('/api/admin/orders', {}, token).catch(() => []),
        apiFetch('/api/admin/users', {}, token).catch(() => [])
      ]);

      setBlogs(bData || []);
      setClientTrans(cData || []);
      setMyTrans(mData || []);
      setVideos(vData || []);
      setMediaFiles(medData || []);
      setWebsiteSettings(settData || {});
      setOrders(oData || []);
      setClients(clData || []);
    } catch (err: any) {
      console.error('Error refreshing admin data:', err);
      showToast('error', err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin' && token) {
      refreshAllData();
    }
  }, [token, user]);

  if (authLoading || (!user || user.role !== 'admin')) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center space-x-3 text-gold">
        <Dumbbell className="h-10 w-10 animate-spin" />
        <span className="text-lg font-bold">Verifying Admin Privileges...</span>
      </div>
    );
  }

  // --- BLOG ACTIONS ---
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', blogForm.title || '');
      formData.append('body', blogForm.body || '');
      formData.append('category', blogForm.category || 'Training');
      formData.append('tags', blogForm.tags || 'fitness,nutrition');
      formData.append('author', blogForm.author || 'Gnaneswar Kokkirala');
      formData.append('is_published', blogForm.is_published ? 'true' : 'false');
      if (blogForm.cover_img_url) formData.append('cover_img_url', blogForm.cover_img_url);
      if (blogForm.cover_file) formData.append('cover_img_file', blogForm.cover_file);

      if (blogModal.mode === 'create') {
        await apiFetch('/api/blogs', { method: 'POST', body: formData }, token!);
        showToast('success', 'Blog post published successfully!');
      } else if (blogModal.item) {
        await apiFetch(`/api/blogs/${blogModal.item.id}`, { method: 'PUT', body: formData }, token!);
        showToast('success', 'Blog post updated successfully!');
      }
      setBlogModal({ isOpen: false, mode: 'create' });
      refreshAllData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save blog post');
    }
  };

  const handleDeleteBlog = (post: BlogPost) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Blog Post',
      message: `Are you sure you want to delete "${post.title}"? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await apiFetch(`/api/blogs/${post.id}`, { method: 'DELETE' }, token!);
          showToast('success', 'Blog post deleted successfully!');
          refreshAllData();
        } catch (err: any) {
          showToast('error', err.message || 'Failed to delete blog post');
        }
      }
    });
  };

  // --- CLIENT TRANSFORMATION ACTIONS ---
  const handleSaveClientTrans = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('client_name', clientTransForm.client_name || '');
      formData.append('story', clientTransForm.story || '');
      formData.append('duration', clientTransForm.duration || '12 Weeks');
      formData.append('before_weight', clientTransForm.before_weight || '');
      formData.append('after_weight', clientTransForm.after_weight || '');
      formData.append('goal', clientTransForm.goal || 'fat loss');
      formData.append('is_published', clientTransForm.is_published ? 'true' : 'false');
      if (clientTransForm.before_img_url) formData.append('before_img_url', clientTransForm.before_img_url);
      if (clientTransForm.after_img_url) formData.append('after_img_url', clientTransForm.after_img_url);
      if (clientTransForm.video_url) formData.append('video_url', clientTransForm.video_url);

      if (clientTransForm.before_file) formData.append('before_img_file', clientTransForm.before_file);
      if (clientTransForm.after_file) formData.append('after_img_file', clientTransForm.after_file);
      if (clientTransForm.video_file) formData.append('video_file', clientTransForm.video_file);

      if (clientTransModal.mode === 'create') {
        await apiFetch('/api/client-transformations', { method: 'POST', body: formData }, token!);
        showToast('success', 'Client transformation added successfully!');
      } else if (clientTransModal.item) {
        await apiFetch(`/api/client-transformations/${clientTransModal.item.id}`, { method: 'PUT', body: formData }, token!);
        showToast('success', 'Client transformation updated successfully!');
      }
      setClientTransModal({ isOpen: false, mode: 'create' });
      refreshAllData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save client transformation');
    }
  };

  const handleDeleteClientTrans = (item: ClientTransformation) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Client Transformation',
      message: `Are you sure you want to delete transformation record for "${item.client_name}"?`,
      onConfirm: async () => {
        try {
          await apiFetch(`/api/client-transformations/${item.id}`, { method: 'DELETE' }, token!);
          showToast('success', 'Client transformation deleted successfully!');
          refreshAllData();
        } catch (err: any) {
          showToast('error', err.message || 'Failed to delete transformation');
        }
      }
    });
  };

  // --- MY TRANSFORMATION ACTIONS ---
  const handleSaveMyTrans = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', myTransForm.title || '');
      formData.append('story', myTransForm.story || '');
      formData.append('duration', myTransForm.duration || '24 Weeks');
      formData.append('before_weight', myTransForm.before_weight || '');
      formData.append('after_weight', myTransForm.after_weight || '');
      formData.append('category', myTransForm.category || 'Bodybuilding Prep');
      formData.append('is_published', myTransForm.is_published ? 'true' : 'false');
      if (myTransForm.before_img_url) formData.append('before_img_url', myTransForm.before_img_url);
      if (myTransForm.after_img_url) formData.append('after_img_url', myTransForm.after_img_url);
      if (myTransForm.after_img_2_url) formData.append('after_img_2_url', myTransForm.after_img_2_url);
      if (myTransForm.video_url) formData.append('video_url', myTransForm.video_url);

      if (myTransForm.before_file) formData.append('before_img_file', myTransForm.before_file);
      if (myTransForm.after_file) formData.append('after_img_file', myTransForm.after_file);
      if (myTransForm.after_file_2) formData.append('after_img_2_file', myTransForm.after_file_2);
      if (myTransForm.video_file) formData.append('video_file', myTransForm.video_file);

      if (myTransModal.mode === 'create') {
        await apiFetch('/api/my-transformations', { method: 'POST', body: formData }, token!);
        showToast('success', 'Coach transformation added successfully!');
      } else if (myTransModal.item) {
        await apiFetch(`/api/my-transformations/${myTransModal.item.id}`, { method: 'PUT', body: formData }, token!);
        showToast('success', 'Coach transformation updated successfully!');
      }
      setMyTransModal({ isOpen: false, mode: 'create' });
      refreshAllData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save coach transformation');
    }
  };

  const handleDeleteMyTrans = (item: MyTransformation) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Coach Transformation',
      message: `Are you sure you want to delete "${item.title}"?`,
      onConfirm: async () => {
        try {
          await apiFetch(`/api/my-transformations/${item.id}`, { method: 'DELETE' }, token!);
          showToast('success', 'Coach transformation deleted successfully!');
          refreshAllData();
        } catch (err: any) {
          showToast('error', err.message || 'Failed to delete record');
        }
      }
    });
  };

  // --- VIDEO ACTIONS ---
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', videoForm.title || '');
      formData.append('description', videoForm.description || '');
      formData.append('client_name', videoForm.client_name || '');
      formData.append('is_published', videoForm.is_published ? 'true' : 'false');
      if (videoForm.video_url) formData.append('video_url', videoForm.video_url);
      if (videoForm.thumbnail_url) formData.append('thumbnail_url', videoForm.thumbnail_url);
      if (videoForm.video_file) formData.append('video_file', videoForm.video_file);
      if (videoForm.thumbnail_file) formData.append('thumbnail_file', videoForm.thumbnail_file);

      if (videoModal.mode === 'create') {
        await apiFetch('/api/transformation-videos', { method: 'POST', body: formData }, token!);
        showToast('success', 'Transformation video added successfully!');
      } else if (videoModal.item) {
        await apiFetch(`/api/transformation-videos/${videoModal.item.id}`, { method: 'PUT', body: formData }, token!);
        showToast('success', 'Transformation video updated successfully!');
      }
      setVideoModal({ isOpen: false, mode: 'create' });
      refreshAllData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save transformation video');
    }
  };

  const handleDeleteVideo = (item: TransformationVideo) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Transformation Video',
      message: `Are you sure you want to delete video "${item.title}"?`,
      onConfirm: async () => {
        try {
          await apiFetch(`/api/transformation-videos/${item.id}`, { method: 'DELETE' }, token!);
          showToast('success', 'Transformation video deleted successfully!');
          refreshAllData();
        } catch (err: any) {
          showToast('error', err.message || 'Failed to delete video');
        }
      }
    });
  };

  // --- MEDIA UPLOAD ACTIONS ---
  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUploadFile) return;
    try {
      const formData = new FormData();
      formData.append('file', mediaUploadFile);
      await apiFetch('/api/admin/media', { method: 'POST', body: formData }, token!);
      showToast('success', 'Media asset uploaded successfully!');
      setMediaUploadFile(null);
      refreshAllData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to upload media file');
    }
  };

  const handleDeleteMedia = (file: MediaFile) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Delete Media File',
      message: `Are you sure you want to delete file "${file.name}"? Checks will verify if it is used in any blogs or transformations.`,
      onConfirm: async () => {
        try {
          await apiFetch(`/api/admin/media/${file.name}`, { method: 'DELETE' }, token!);
          showToast('success', 'Media file deleted!');
          refreshAllData();
        } catch (err: any) {
          showToast('error', err.message || 'Cannot delete media file');
        }
      }
    });
  };

  // --- WEBSITE SETTINGS ACTIONS ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/settings', { method: 'POST', body: JSON.stringify(websiteSettings) }, token!);
      showToast('success', 'Website settings updated successfully!');
      refreshAllData();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update website settings');
    }
  };

  // --- CLIENT CHAT ACTIONS ---
  const fetchChatHistory = async (clientId: number) => {
    if (!token || !clientId) return;
    setChatLoading(true);
    try {
      const history = await apiFetch(`/api/chat/history?recipient_id=${clientId}`, {}, token);
      setChatMessages(history || []);
      await apiFetch(`/api/chat/read?sender_id=${clientId}`, { method: 'POST' }, token).catch(() => {});
    } catch (err: any) {
      console.error('Error loading chat:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatClient || (!chatText.trim() && !chatFile) || !token) return;

    try {
      const formData = new FormData();
      formData.append('receiver_id', selectedChatClient.id.toString());
      if (chatText.trim()) formData.append('content', chatText.trim());
      if (chatFile) formData.append('file', chatFile);

      await apiFetch('/api/chat/send', { method: 'POST', body: formData }, token);
      setChatText('');
      setChatFile(null);
      fetchChatHistory(selectedChatClient.id);
      showToast('success', 'Message sent to client!');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to send message');
    }
  };

  const filteredMedia = mediaFiles.filter(m => m.name.toLowerCase().includes(mediaSearch.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#07080c] text-foreground flex flex-col md:flex-row">
      {/* Toast Notification */}
      {actionMessage && (
        <div
          className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-2xl border shadow-2xl flex items-center space-x-3 text-sm font-bold animate-bounce ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
              : 'bg-red-950/90 border-red-500 text-red-300'
          }`}
        >
          {actionMessage.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <AlertCircle className="h-5 w-5 text-red-400" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-[#0c0d12] border-b md:border-b-0 md:border-r border-card-border/80 p-6 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-8">
          {/* Header Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden border border-gold/40 shadow-[0_0_15px_rgba(229,169,60,0.3)]">
              <img src="/logo.png?v=2" alt="Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wider text-white uppercase">
                Gnaneswar<span className="gold-gradient-text">FIT</span>
              </h2>
              <span className="text-[10px] uppercase font-bold text-gold flex items-center space-x-1">
                <ShieldCheck className="h-3 w-3" />
                <span>Admin Management CMS</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'bg-gold text-black shadow-[0_0_15px_rgba(229,169,60,0.3)]'
                  : 'text-gray-400 hover:text-white hover:bg-card-bg'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Overview Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('blogs')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${
                activeTab === 'blogs'
                  ? 'bg-gold text-black shadow-[0_0_15px_rgba(229,169,60,0.3)]'
                  : 'text-gray-400 hover:text-white hover:bg-card-bg'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4" />
                <span>Blog Management</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-bold">
                {blogs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('client-transformations')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${
                activeTab === 'client-transformations'
                  ? 'bg-gold text-black shadow-[0_0_15px_rgba(229,169,60,0.3)]'
                  : 'text-gray-400 hover:text-white hover:bg-card-bg'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4" />
                <span>Client Transformations</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-bold">
                {clientTrans.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('my-transformations')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${
                activeTab === 'my-transformations'
                  ? 'bg-gold text-black shadow-[0_0_15px_rgba(229,169,60,0.3)]'
                  : 'text-gray-400 hover:text-white hover:bg-card-bg'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Sparkles className="h-4 w-4" />
                <span>My Transformations</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-bold">
                {myTrans.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${
                activeTab === 'videos'
                  ? 'bg-gold text-black shadow-[0_0_15px_rgba(229,169,60,0.3)]'
                  : 'text-gray-400 hover:text-white hover:bg-card-bg'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Film className="h-4 w-4" />
                <span>Transformation Videos</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-bold">
                {videos.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('media')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${
                activeTab === 'media'
                  ? 'bg-gold text-black shadow-[0_0_15px_rgba(229,169,60,0.3)]'
                  : 'text-gray-400 hover:text-white hover:bg-card-bg'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ImageIcon className="h-4 w-4" />
                <span>Media Library</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-bold">
                {mediaFiles.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('chat');
                if (clients.length > 0 && !selectedChatClient) {
                  const firstClient = clients.find(c => c.role !== 'admin') || clients[0];
                  setSelectedChatClient(firstClient);
                  if (firstClient) fetchChatHistory(firstClient.id);
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${
                activeTab === 'chat'
                  ? 'bg-gold text-black shadow-[0_0_15px_rgba(229,169,60,0.3)]'
                  : 'text-gray-400 hover:text-white hover:bg-card-bg'
              }`}
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-4 w-4" />
                <span>Client Messages / Chat</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-bold">
                {clients.filter(c => c.role !== 'admin').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                activeTab === 'settings'
                  ? 'bg-gold text-black shadow-[0_0_15px_rgba(229,169,60,0.3)]'
                  : 'text-gray-400 hover:text-white hover:bg-card-bg'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Website Settings</span>
            </button>
          </nav>
        </div>

        {/* User Footer & Logout */}
        <div className="pt-6 border-t border-card-border/80 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold font-black">
              GK
            </div>
            <div className="text-xs truncate">
              <p className="font-extrabold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 py-2.5 rounded-xl text-xs font-bold transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        
        {/* Top Header Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-card-border/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <span>Admin Panel</span>
              <span className="text-gold">•</span>
              <span className="text-gold text-lg capitalize">{activeTab.replace('-', ' ')}</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Manage website content, client transformations, blogs, media, and site settings cleanly.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={refreshAllData}
              className="inline-flex items-center space-x-1.5 bg-card-bg hover:bg-card-border text-gray-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold border border-card-border transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 bg-gold/10 hover:bg-gold/20 text-gold px-4 py-2 rounded-xl text-xs font-bold border border-gold/30 transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>View Live Website</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glass-panel p-6 rounded-3xl border border-card-border space-y-2">
                <p className="text-[10px] text-gold font-bold uppercase tracking-wider">Total Blog Posts</p>
                <p className="text-3xl font-black text-white">{blogs.length}</p>
                <p className="text-[11px] text-gray-400">{blogs.filter(b => b.is_published).length} Published</p>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-card-border space-y-2">
                <p className="text-[10px] text-gold font-bold uppercase tracking-wider">Client Transformations</p>
                <p className="text-3xl font-black text-white">{clientTrans.length}</p>
                <p className="text-[11px] text-gray-400">{clientTrans.filter(c => c.is_published).length} Published</p>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-card-border space-y-2">
                <p className="text-[10px] text-gold font-bold uppercase tracking-wider">Transformation Videos</p>
                <p className="text-3xl font-black text-white">{videos.length}</p>
                <p className="text-[11px] text-gray-400">{videos.filter(v => v.is_published).length} Active</p>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-card-border space-y-2">
                <p className="text-[10px] text-gold font-bold uppercase tracking-wider">Media Assets</p>
                <p className="text-3xl font-black text-white">{mediaFiles.length}</p>
                <p className="text-[11px] text-gray-400">Uploaded Photos/Videos</p>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="glass-panel p-8 rounded-3xl border border-card-border space-y-6">
              <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-gold" />
                <span>Quick Content Creation</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => {
                    setBlogForm({
                      title: '',
                      body: '',
                      category: 'Training',
                      tags: 'fitness,nutrition',
                      author: 'Gnaneswar Kokkirala',
                      is_published: true,
                      cover_img_url: '',
                      cover_file: null
                    });
                    setBlogModal({ isOpen: true, mode: 'create' });
                  }}
                  className="p-6 bg-[#10121a] hover:bg-[#161824] border border-gold/30 rounded-2xl text-left space-y-3 transition-colors group"
                >
                  <FileText className="h-8 w-8 text-gold group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="text-base font-extrabold text-white">Create Blog Post</h4>
                    <p className="text-xs text-gray-400">Publish articles on training, fat loss, and diet.</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setClientTransForm({
                      client_name: '',
                      story: '',
                      duration: '12 Weeks',
                      before_weight: '',
                      after_weight: '',
                      goal: 'fat loss',
                      is_published: true,
                      before_img_url: '',
                      after_img_url: '',
                      video_url: '',
                      before_file: null,
                      after_file: null,
                      video_file: null
                    });
                    setClientTransModal({ isOpen: true, mode: 'create' });
                  }}
                  className="p-6 bg-[#10121a] hover:bg-[#161824] border border-gold/30 rounded-2xl text-left space-y-3 transition-colors group"
                >
                  <Users className="h-8 w-8 text-gold group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="text-base font-extrabold text-white">Add Client Transformation</h4>
                    <p className="text-xs text-gray-400">Upload before/after photos, story & results.</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setVideoForm({
                      title: '',
                      description: '',
                      client_name: '',
                      is_published: true,
                      video_url: '',
                      thumbnail_url: '',
                      video_file: null,
                      thumbnail_file: null
                    });
                    setVideoModal({ isOpen: true, mode: 'create' });
                  }}
                  className="p-6 bg-[#10121a] hover:bg-[#161824] border border-gold/30 rounded-2xl text-left space-y-3 transition-colors group"
                >
                  <Film className="h-8 w-8 text-gold group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="text-base font-extrabold text-white">Upload Transformation Video</h4>
                    <p className="text-xs text-gray-400">Add client or coach transformation MP4 videos.</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BLOG MANAGEMENT */}
        {activeTab === 'blogs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl font-extrabold text-white">Blog Posts ({blogs.length})</h2>
              <button
                onClick={() => {
                  setBlogForm({
                    title: '',
                    body: '',
                    category: 'Training',
                    tags: 'fitness,nutrition',
                    author: 'Gnaneswar Kokkirala',
                    is_published: true,
                    cover_img_url: '',
                    cover_file: null
                  });
                  setBlogModal({ isOpen: true, mode: 'create' });
                }}
                className="inline-flex items-center space-x-2 text-xs font-bold text-black gold-gradient-bg px-5 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Blog Post</span>
              </button>
            </div>

            <div className="glass-panel rounded-3xl border border-card-border overflow-hidden">
              {blogs.length === 0 ? (
                <div className="p-12 text-center text-gray-400 space-y-3">
                  <FileText className="h-10 w-10 text-gold/40 mx-auto" />
                  <p>No blog posts created yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#0e1017] uppercase text-[10px] text-gold border-b border-card-border">
                      <tr>
                        <th className="p-4">Cover</th>
                        <th className="p-4">Title</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border">
                      {blogs.map((b) => (
                        <tr key={b.id} className="hover:bg-card-bg/50">
                          <td className="p-4">
                            <div className="h-12 w-16 rounded-lg overflow-hidden bg-black border border-card-border">
                              {b.cover_img ? (
                                <img src={resolveMediaUrl(b.cover_img)} alt={b.title} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full bg-card-bg flex items-center justify-center text-gray-500">No img</div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 font-bold text-white max-w-xs truncate">{b.title}</td>
                          <td className="p-4"><span className="px-2.5 py-1 bg-gold/10 text-gold border border-gold/20 rounded-full font-semibold">{b.category || 'Bodybuilding'}</span></td>
                          <td className="p-4">
                            {b.is_published ? (
                              <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full font-bold">Published</span>
                            ) : (
                              <span className="px-2.5 py-1 bg-gray-800 text-gray-400 rounded-full font-bold">Draft</span>
                            )}
                          </td>
                          <td className="p-4 text-gray-400">{new Date(b.published_at).toLocaleDateString()}</td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setBlogForm({
                                  title: b.title,
                                  body: b.body,
                                  category: b.category || 'Training',
                                  tags: b.tags || 'fitness,nutrition',
                                  author: b.author || 'Gnaneswar Kokkirala',
                                  is_published: b.is_published,
                                  cover_img_url: b.cover_img || '',
                                  cover_file: null
                                });
                                setBlogModal({ isOpen: true, mode: 'edit', item: b });
                              }}
                              className="p-2 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(b)}
                              className="p-2 rounded-lg bg-red-950/50 hover:bg-red-900 text-red-300 border border-red-800/40"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CLIENT TRANSFORMATIONS */}
        {activeTab === 'client-transformations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl font-extrabold text-white">Client Transformations ({clientTrans.length})</h2>
              <button
                onClick={() => {
                  setClientTransForm({
                    client_name: '',
                    story: '',
                    duration: '12 Weeks',
                    before_weight: '',
                    after_weight: '',
                    goal: 'fat loss',
                    is_published: true,
                    before_img_url: '',
                    after_img_url: '',
                    video_url: '',
                    before_file: null,
                    after_file: null,
                    video_file: null
                  });
                  setClientTransModal({ isOpen: true, mode: 'create' });
                }}
                className="inline-flex items-center space-x-2 text-xs font-bold text-black gold-gradient-bg px-5 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                <Plus className="h-4 w-4" />
                <span>Add Client Transformation</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clientTrans.map((item) => (
                <div key={item.id} className="glass-panel p-6 rounded-3xl border border-card-border space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-extrabold text-white">{item.client_name}</h3>
                      {item.is_published ? (
                        <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-800">Published</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-gray-800 text-gray-400 text-[10px] font-bold rounded-full">Draft</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-36 rounded-2xl overflow-hidden bg-black border border-card-border p-1">
                        <img src={resolveMediaUrl(item.before_img)} alt="Before" className="h-full w-full object-contain" />
                      </div>
                      <div className="h-36 rounded-2xl overflow-hidden bg-black border border-gold/30 p-1">
                        <img src={resolveMediaUrl(item.after_img)} alt="After" className="h-full w-full object-contain" />
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 line-clamp-3">{item.story}</p>
                    <div className="text-[11px] text-gray-400 flex items-center justify-between border-t border-card-border/60 pt-2">
                      <span>Goal: <strong className="text-gold capitalize">{item.goal}</strong></span>
                      <span>Duration: <strong>{item.duration}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-4 border-t border-card-border">
                    <button
                      onClick={() => {
                        setClientTransForm({
                          client_name: item.client_name,
                          story: item.story,
                          duration: item.duration || '12 Weeks',
                          before_weight: item.before_weight || '',
                          after_weight: item.after_weight || '',
                          goal: item.goal || 'fat loss',
                          is_published: item.is_published,
                          before_img_url: item.before_img || '',
                          after_img_url: item.after_img || '',
                          video_url: item.video_url || '',
                          before_file: null,
                          after_file: null,
                          video_file: null
                        });
                        setClientTransModal({ isOpen: true, mode: 'edit', item });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold text-xs font-bold border border-gold/30 flex items-center space-x-1"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteClientTrans(item)}
                      className="px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900 text-red-300 text-xs font-bold border border-red-800/40 flex items-center space-x-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MY TRANSFORMATIONS */}
        {activeTab === 'my-transformations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl font-extrabold text-white">Coach Self Transformations ({myTrans.length})</h2>
              <button
                onClick={() => {
                  setMyTransForm({
                    title: 'Personal Contest Transformation',
                    story: '',
                    duration: '24 Weeks',
                    before_weight: '60 kg',
                    after_weight: '70 kg',
                    category: 'Bodybuilding Prep',
                    is_published: true,
                    before_img_url: '',
                    after_img_url: '',
                    after_img_2_url: '',
                    video_url: '',
                    before_file: null,
                    after_file: null,
                    after_file_2: null,
                    video_file: null
                  });
                  setMyTransModal({ isOpen: true, mode: 'create' });
                }}
                className="inline-flex items-center space-x-2 text-xs font-bold text-black gold-gradient-bg px-5 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                <Plus className="h-4 w-4" />
                <span>Add Coach Transformation</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {myTrans.map((item) => (
                <div key={item.id} className="glass-panel p-6 rounded-3xl border border-card-border space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-extrabold text-white">{item.title}</h3>
                    {item.is_published ? (
                      <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-800">Published</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-gray-800 text-gray-400 text-[10px] font-bold rounded-full">Draft</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="h-44 rounded-2xl overflow-hidden bg-black border border-card-border p-1">
                      <img src={resolveMediaUrl(item.before_img)} alt="Before" className="h-full w-full object-contain" />
                    </div>
                    <div className="h-44 rounded-2xl overflow-hidden bg-black border border-gold/30 p-1">
                      <img src={resolveMediaUrl(item.after_img)} alt="After Front" className="h-full w-full object-contain" />
                    </div>
                    <div className="h-44 rounded-2xl overflow-hidden bg-black border border-gold/30 p-1">
                      <img src={resolveMediaUrl(item.after_img_2 || item.after_img)} alt="After Side" className="h-full w-full object-contain" />
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">{item.story}</p>

                  <div className="flex items-center justify-between border-t border-card-border pt-4">
                    <div className="text-xs text-gray-400 space-x-4">
                      <span>Before: <strong className="text-white">{item.before_weight}</strong></span>
                      <span>After: <strong className="text-gold">{item.after_weight}</strong></span>
                      <span>Duration: <strong>{item.duration}</strong></span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setMyTransForm({
                            title: item.title,
                            story: item.story,
                            duration: item.duration || '24 Weeks',
                            before_weight: item.before_weight || '60 kg',
                            after_weight: item.after_weight || '70 kg',
                            category: item.category || 'Bodybuilding Prep',
                            is_published: item.is_published,
                            before_img_url: item.before_img || '',
                            after_img_url: item.after_img || '',
                            after_img_2_url: item.after_img_2 || '',
                            video_url: item.video_url || '',
                            before_file: null,
                            after_file: null,
                            after_file_2: null,
                            video_file: null
                          });
                          setMyTransModal({ isOpen: true, mode: 'edit', item });
                        }}
                        className="px-3 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold text-xs font-bold border border-gold/30"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteMyTrans(item)}
                        className="px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900 text-red-300 text-xs font-bold border border-red-800/40"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: TRANSFORMATION VIDEOS */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl font-extrabold text-white">Transformation Videos ({videos.length})</h2>
              <button
                onClick={() => {
                  setVideoForm({
                    title: '',
                    description: '',
                    client_name: '',
                    is_published: true,
                    video_url: '',
                    thumbnail_url: '',
                    video_file: null,
                    thumbnail_file: null
                  });
                  setVideoModal({ isOpen: true, mode: 'create' });
                }}
                className="inline-flex items-center space-x-2 text-xs font-bold text-black gold-gradient-bg px-5 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                <Plus className="h-4 w-4" />
                <span>Upload Transformation Video</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((v) => (
                <div key={v.id} className="glass-panel p-5 rounded-3xl border border-card-border space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-black border border-card-border flex items-center justify-center">
                      {v.thumbnail_url ? (
                        <img src={resolveMediaUrl(v.thumbnail_url)} alt={v.title} className="h-full w-full object-cover" />
                      ) : (
                        <Film className="h-10 w-10 text-gold/40" />
                      )}
                      <a
                        href={resolveMediaUrl(v.video_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-gold text-black flex items-center justify-center shadow-lg"
                      >
                        <Play className="h-5 w-5 fill-black ml-0.5" />
                      </a>
                    </div>

                    <h4 className="text-base font-extrabold text-white line-clamp-1">{v.title}</h4>
                    {v.description && <p className="text-xs text-gray-400 line-clamp-2">{v.description}</p>}
                  </div>

                  <div className="flex items-center justify-between border-t border-card-border pt-3">
                    <span className="text-[10px] text-gold font-bold uppercase">{v.is_published ? 'Published' : 'Draft'}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          setVideoForm({
                            title: v.title,
                            description: v.description || '',
                            client_name: v.client_name || '',
                            is_published: v.is_published,
                            video_url: v.video_url || '',
                            thumbnail_url: v.thumbnail_url || '',
                            video_file: null,
                            thumbnail_file: null
                          });
                          setVideoModal({ isOpen: true, mode: 'edit', item: v });
                        }}
                        className="p-1.5 rounded-lg bg-gold/10 text-gold hover:bg-gold/20"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(v)}
                        className="p-1.5 rounded-lg bg-red-950/50 text-red-300 hover:bg-red-900"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: MEDIA LIBRARY */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl font-extrabold text-white">Media Library ({mediaFiles.length})</h2>
              
              {/* Media Upload Form */}
              <form onSubmit={handleUploadMedia} className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setMediaUploadFile(e.target.files?.[0] || null)}
                  className="text-xs text-gray-400 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-card-bg file:text-gold hover:file:bg-card-border"
                />
                <button
                  type="submit"
                  disabled={!mediaUploadFile}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-black gold-gradient-bg px-4 py-2 rounded-full disabled:opacity-50"
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>Upload</span>
                </button>
              </form>
            </div>

            {/* Search Filter */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                placeholder="Search uploaded file names..."
                className="w-full bg-[#090a0f] border border-card-border focus:border-gold rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredMedia.map((m, idx) => (
                <div key={idx} className="glass-panel p-2 rounded-2xl border border-card-border space-y-2 group relative">
                  <div className="h-32 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                    {m.name.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                      <img src={resolveMediaUrl(m.url)} alt={m.name} className="h-full w-full object-cover" />
                    ) : (
                      <Film className="h-8 w-8 text-gold/60" />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-300 font-bold truncate px-1">{m.name}</p>
                  <div className="flex items-center justify-between text-[9px] text-gray-500 px-1">
                    <span>{(m.size / 1024).toFixed(0)} KB</span>
                    <button
                      onClick={() => handleDeleteMedia(m)}
                      className="text-red-400 hover:text-red-300 font-bold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: CLIENT MESSAGES & CHAT */}
        {activeTab === 'chat' && (
          <div className="glass-panel p-6 rounded-3xl border border-card-border space-y-6">
            <div className="flex items-center justify-between border-b border-card-border pb-4">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Client Messaging & Live Chat</h2>
                <p className="text-xs text-gray-400">Directly communicate with clients, review check-ins, send progress feedback and files.</p>
              </div>
              <span className="px-3 py-1 bg-gold/10 border border-gold/30 text-gold rounded-full text-xs font-extrabold flex items-center space-x-1">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{clients.filter(c => c.role !== 'admin').length} Clients Registered</span>
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
              {/* Left Column: Client List */}
              <div className="lg:col-span-4 glass-panel p-4 rounded-2xl border border-card-border flex flex-col space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    placeholder="Search clients..."
                    className="w-full bg-[#090a0f] border border-card-border focus:border-gold rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>

                <div className="overflow-y-auto flex-1 space-y-2 max-h-[450px]">
                  {clients.filter(c => c.role !== 'admin' && (c.full_name?.toLowerCase().includes(chatSearch.toLowerCase()) || c.email?.toLowerCase().includes(chatSearch.toLowerCase()))).length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-500">No client accounts found.</div>
                  ) : (
                    clients
                      .filter(c => c.role !== 'admin' && (c.full_name?.toLowerCase().includes(chatSearch.toLowerCase()) || c.email?.toLowerCase().includes(chatSearch.toLowerCase())))
                      .map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedChatClient(c);
                            fetchChatHistory(c.id);
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            selectedChatClient?.id === c.id
                              ? 'bg-gold/10 border-gold shadow-[0_0_10px_rgba(229,169,60,0.2)]'
                              : 'bg-black/40 border-card-border hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center space-x-3 truncate">
                            <div className="h-9 w-9 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold font-extrabold text-xs shrink-0">
                              {c.full_name ? c.full_name.substring(0, 2).toUpperCase() : 'CL'}
                            </div>
                            <div className="truncate text-xs">
                              <p className="font-bold text-white truncate">{c.full_name || c.email}</p>
                              <p className="text-[10px] text-gray-400 truncate">{c.email}</p>
                            </div>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-card-bg text-gray-400 border border-card-border shrink-0">
                            Client
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Right Column: Chat History & Input */}
              <div className="lg:col-span-8 glass-panel p-4 rounded-2xl border border-card-border flex flex-col justify-between space-y-4">
                {selectedChatClient ? (
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-card-border pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold font-extrabold text-sm">
                          {selectedChatClient.full_name ? selectedChatClient.full_name.substring(0, 2).toUpperCase() : 'CL'}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{selectedChatClient.full_name || selectedChatClient.email}</h4>
                          <p className="text-[10px] text-gray-400">{selectedChatClient.email} {selectedChatClient.phone ? `• ${selectedChatClient.phone}` : ''}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => fetchChatHistory(selectedChatClient.id)}
                        className="px-3 py-1 bg-card-bg border border-gold/30 text-gold rounded-full text-xs font-bold hover:bg-gold/10"
                      >
                        Refresh Chat
                      </button>
                    </div>

                    {/* Messages Scroll Box */}
                    <div className="overflow-y-auto flex-1 p-3 space-y-3 min-h-[320px] max-h-[380px] bg-black/50 rounded-xl border border-card-border">
                      {chatLoading ? (
                        <div className="flex justify-center items-center py-12">
                          <Dumbbell className="h-6 w-6 text-gold animate-spin" />
                        </div>
                      ) : chatMessages.length === 0 ? (
                        <div className="text-center py-16 space-y-2">
                          <MessageSquare className="h-8 w-8 text-gold/40 mx-auto" />
                          <p className="text-xs text-gray-400">No chat history with {selectedChatClient.full_name || 'this client'}.</p>
                          <p className="text-[10px] text-gray-500">Send a greeting message or progress check-in below!</p>
                        </div>
                      ) : (
                        chatMessages.map((msg) => {
                          const isFromAdmin = msg.sender_id === user?.id || msg.sender_id !== selectedChatClient.id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isFromAdmin ? 'items-end' : 'items-start'}`}
                            >
                              <div
                                className={`max-w-[75%] p-3 rounded-2xl text-xs space-y-1 ${
                                  isFromAdmin
                                    ? 'bg-gold text-black rounded-br-none shadow-[0_0_10px_rgba(229,169,60,0.2)]'
                                    : 'bg-[#121520] text-white border border-card-border rounded-bl-none'
                                }`}
                              >
                                {msg.content && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                                {msg.file_url && (
                                  <div className="pt-1">
                                    {msg.file_type === 'image' ? (
                                      <img src={resolveMediaUrl(msg.file_url)} alt="Attachment" className="max-h-48 rounded-lg object-cover" />
                                    ) : (
                                      <a
                                        href={resolveMediaUrl(msg.file_url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center space-x-1 font-bold underline ${isFromAdmin ? 'text-black' : 'text-gold'}`}
                                      >
                                        <Paperclip className="h-3.5 w-3.5" />
                                        <span>View File ({msg.file_type || 'attachment'})</span>
                                      </a>
                                    )}
                                  </div>
                                )}
                                <span className={`block text-[9px] text-right ${isFromAdmin ? 'text-black/70' : 'text-gray-400'}`}>
                                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Chat Input Form */}
                    <form onSubmit={handleSendChatMessage} className="space-y-2">
                      {chatFile && (
                        <div className="flex items-center justify-between px-3 py-1.5 bg-gold/10 border border-gold/30 rounded-xl text-xs text-gold">
                          <span className="truncate">Attached: {chatFile.name}</span>
                          <button type="button" onClick={() => setChatFile(null)} className="text-red-400 hover:text-white font-bold ml-2">✕</button>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <label className="p-2.5 bg-card-bg border border-card-border rounded-xl text-gray-400 hover:text-gold cursor-pointer shrink-0">
                          <Paperclip className="h-4 w-4" />
                          <input
                            type="file"
                            onChange={(e) => setChatFile(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </label>

                        <input
                          type="text"
                          value={chatText}
                          onChange={(e) => setChatText(e.target.value)}
                          placeholder={`Message ${selectedChatClient.full_name || 'client'}...`}
                          className="flex-1 bg-[#090a0f] border border-card-border focus:border-gold rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                        />

                        <button
                          type="submit"
                          disabled={!chatText.trim() && !chatFile}
                          className="px-4 py-2.5 gold-gradient-bg text-black font-bold rounded-xl text-xs flex items-center space-x-1 hover:scale-105 transition-all disabled:opacity-40 shrink-0"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Send</span>
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 space-y-3">
                    <Users className="h-10 w-10 text-gold/40" />
                    <p className="text-sm font-bold text-white">Select a client from the left list to start messaging.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: WEBSITE SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="glass-panel p-8 rounded-3xl border border-card-border space-y-6 max-w-3xl">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Website Settings</h2>
            
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Site Title</label>
                <input
                  type="text"
                  value={websiteSettings.site_name || ''}
                  onChange={(e) => setWebsiteSettings({ ...websiteSettings, site_name: e.target.value })}
                  className="w-full bg-[#090a0f] border border-card-border rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Tagline</label>
                <input
                  type="text"
                  value={websiteSettings.site_tagline || ''}
                  onChange={(e) => setWebsiteSettings({ ...websiteSettings, site_tagline: e.target.value })}
                  className="w-full bg-[#090a0f] border border-card-border rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Coach Name</label>
                <input
                  type="text"
                  value={websiteSettings.coach_name || ''}
                  onChange={(e) => setWebsiteSettings({ ...websiteSettings, coach_name: e.target.value })}
                  className="w-full bg-[#090a0f] border border-card-border rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Coach Biography</label>
                <textarea
                  rows={3}
                  value={websiteSettings.coach_bio || ''}
                  onChange={(e) => setWebsiteSettings({ ...websiteSettings, coach_bio: e.target.value })}
                  className="w-full bg-[#090a0f] border border-card-border rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={websiteSettings.contact_email || ''}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, contact_email: e.target.value })}
                    className="w-full bg-[#090a0f] border border-card-border rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={websiteSettings.contact_phone || ''}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, contact_phone: e.target.value })}
                    className="w-full bg-[#090a0f] border border-card-border rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="text-xs font-bold text-black gold-gradient-bg px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              Save Website Settings
            </button>
          </form>
        )}

      </main>

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1017] border border-red-800/60 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-white flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span>{deleteConfirm.title}</span>
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">{deleteConfirm.message}</p>
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-card-border">
              <button
                onClick={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-300 bg-card-bg hover:bg-card-border"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteConfirm.onConfirm();
                  setDeleteConfirm({ ...deleteConfirm, isOpen: false });
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLOG FORM MODAL */}
      {blogModal.isOpen && (
        <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveBlog} className="bg-[#0e1017] border border-gold/40 rounded-3xl p-8 max-w-2xl w-full space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-card-border pb-4">
              <h3 className="text-lg font-extrabold text-white">
                {blogModal.mode === 'create' ? 'Create New Blog Post' : 'Edit Blog Post'}
              </h3>
              <button type="button" onClick={() => setBlogModal({ isOpen: false, mode: 'create' })} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  placeholder="e.g. How to Master Progressive Overload"
                  className="w-full bg-[#050507] border border-card-border rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Category</label>
                  <select
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                    className="w-full bg-[#050507] border border-card-border rounded-xl px-4 py-2.5 text-white"
                  >
                    <option value="Training">Training</option>
                    <option value="Nutrition">Nutrition</option>
                    <option value="Bodybuilding">Bodybuilding</option>
                    <option value="Supplements">Supplements</option>
                    <option value="Recovery">Recovery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    value={blogForm.tags}
                    onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                    placeholder="fitness,hypertrophy,diet"
                    className="w-full bg-[#050507] border border-card-border rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Article Body (Markdown Supported) *</label>
                <textarea
                  rows={8}
                  required
                  value={blogForm.body}
                  onChange={(e) => setBlogForm({ ...blogForm, body: e.target.value })}
                  placeholder="Write post content..."
                  className="w-full bg-[#050507] border border-card-border rounded-xl p-4 text-white font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-400 font-bold">Featured Cover Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={blogForm.cover_img_url}
                    onChange={(e) => setBlogForm({ ...blogForm, cover_img_url: e.target.value })}
                    placeholder="Enter image URL or select from media library..."
                    className="flex-1 bg-[#050507] border border-card-border rounded-xl px-4 py-2 text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaPicker({
                      isOpen: true,
                      onSelect: (url) => setBlogForm({ ...blogForm, cover_img_url: url })
                    })}
                    className="px-3 py-2 bg-card-bg border border-gold/40 text-gold rounded-xl text-xs font-bold hover:bg-gold/10 shrink-0 flex items-center space-x-1"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Pick Media</span>
                  </button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBlogForm({ ...blogForm, cover_file: e.target.files?.[0] || null })}
                  className="text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-card-bg file:text-gold"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="b_pub"
                  checked={blogForm.is_published}
                  onChange={(e) => setBlogForm({ ...blogForm, is_published: e.target.checked })}
                  className="rounded border-card-border text-gold focus:ring-gold"
                />
                <label htmlFor="b_pub" className="text-gray-300 font-bold cursor-pointer">Publish immediately to public website</label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-card-border">
              <button
                type="button"
                onClick={() => setBlogModal({ isOpen: false, mode: 'create' })}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-300 bg-card-bg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-black gold-gradient-bg shadow-lg"
              >
                Save Blog Post
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CLIENT TRANSFORMATION MODAL */}
      {clientTransModal.isOpen && (
        <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveClientTrans} className="bg-[#0e1017] border border-gold/40 rounded-3xl p-8 max-w-2xl w-full space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-card-border pb-4">
              <h3 className="text-lg font-extrabold text-white">
                {clientTransModal.mode === 'create' ? 'Add Client Transformation' : 'Edit Client Transformation'}
              </h3>
              <button type="button" onClick={() => setClientTransModal({ isOpen: false, mode: 'create' })} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={clientTransForm.client_name}
                    onChange={(e) => setClientTransForm({ ...clientTransForm, client_name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-[#050507] border border-card-border rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Goal</label>
                  <select
                    value={clientTransForm.goal}
                    onChange={(e) => setClientTransForm({ ...clientTransForm, goal: e.target.value })}
                    className="w-full bg-[#050507] border border-card-border rounded-xl px-4 py-2.5 text-white"
                  >
                    <option value="fat loss">Fat Loss</option>
                    <option value="muscle gain">Muscle Gain</option>
                    <option value="recomp">Body Recomposition</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Duration</label>
                  <input
                    type="text"
                    value={clientTransForm.duration}
                    onChange={(e) => setClientTransForm({ ...clientTransForm, duration: e.target.value })}
                    placeholder="e.g. 12 Weeks"
                    className="w-full bg-[#050507] border border-card-border rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Before Weight</label>
                  <input
                    type="text"
                    value={clientTransForm.before_weight}
                    onChange={(e) => setClientTransForm({ ...clientTransForm, before_weight: e.target.value })}
                    placeholder="e.g. 90 kg"
                    className="w-full bg-[#050507] border border-card-border rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">After Weight</label>
                  <input
                    type="text"
                    value={clientTransForm.after_weight}
                    onChange={(e) => setClientTransForm({ ...clientTransForm, after_weight: e.target.value })}
                    placeholder="e.g. 75 kg"
                    className="w-full bg-[#050507] border border-card-border rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Short Description / Story *</label>
                <textarea
                  rows={4}
                  required
                  value={clientTransForm.story}
                  onChange={(e) => setClientTransForm({ ...clientTransForm, story: e.target.value })}
                  placeholder="Describe transformation journey and diet protocol..."
                  className="w-full bg-[#050507] border border-card-border rounded-xl p-3 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-gray-400 font-bold">Before Image *</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={clientTransForm.before_img_url}
                      onChange={(e) => setClientTransForm({ ...clientTransForm, before_img_url: e.target.value })}
                      placeholder="Image URL or pick..."
                      className="flex-1 bg-[#050507] border border-card-border rounded-xl px-3 py-1.5 text-white text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaPicker({
                        isOpen: true,
                        onSelect: (url) => setClientTransForm({ ...clientTransForm, before_img_url: url })
                      })}
                      className="px-2.5 py-1.5 bg-card-bg border border-gold/40 text-gold rounded-xl text-[11px] font-bold hover:bg-gold/10 shrink-0"
                    >
                      Pick
                    </button>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setClientTransForm({ ...clientTransForm, before_file: e.target.files?.[0] || null })}
                    className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-card-bg file:text-gold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-gray-400 font-bold">After Image *</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={clientTransForm.after_img_url}
                      onChange={(e) => setClientTransForm({ ...clientTransForm, after_img_url: e.target.value })}
                      placeholder="Image URL or pick..."
                      className="flex-1 bg-[#050507] border border-card-border rounded-xl px-3 py-1.5 text-white text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaPicker({
                        isOpen: true,
                        onSelect: (url) => setClientTransForm({ ...clientTransForm, after_img_url: url })
                      })}
                      className="px-2.5 py-1.5 bg-card-bg border border-gold/40 text-gold rounded-xl text-[11px] font-bold hover:bg-gold/10 shrink-0"
                    >
                      Pick
                    </button>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setClientTransForm({ ...clientTransForm, after_file: e.target.files?.[0] || null })}
                    className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-card-bg file:text-gold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 font-bold">Transformation Video (Optional MP4 / URL)</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={clientTransForm.video_url}
                    onChange={(e) => setClientTransForm({ ...clientTransForm, video_url: e.target.value })}
                    placeholder="Video URL or select from library..."
                    className="flex-1 bg-[#050507] border border-card-border rounded-xl px-3 py-1.5 text-white text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaPicker({
                      isOpen: true,
                      onSelect: (url) => setClientTransForm({ ...clientTransForm, video_url: url })
                    })}
                    className="px-2.5 py-1.5 bg-card-bg border border-gold/40 text-gold rounded-xl text-[11px] font-bold hover:bg-gold/10 shrink-0"
                  >
                    Pick
                  </button>
                </div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setClientTransForm({ ...clientTransForm, video_file: e.target.files?.[0] || null })}
                  className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-card-bg file:text-gold"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="c_pub"
                  checked={clientTransForm.is_published}
                  onChange={(e) => setClientTransForm({ ...clientTransForm, is_published: e.target.checked })}
                  className="rounded border-card-border text-gold focus:ring-gold"
                />
                <label htmlFor="c_pub" className="text-gray-300 font-bold cursor-pointer">Publish immediately on website</label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-card-border">
              <button
                type="button"
                onClick={() => setClientTransModal({ isOpen: false, mode: 'create' })}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-300 bg-card-bg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-black gold-gradient-bg shadow-lg"
              >
                Save Transformation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* COACH MY TRANSFORMATION MODAL */}
      {myTransModal.isOpen && (
        <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveMyTrans} className="bg-[#0e1017] border border-gold/40 rounded-3xl p-8 max-w-2xl w-full space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-card-border pb-4">
              <h3 className="text-lg font-extrabold text-white">
                {myTransModal.mode === 'create' ? 'Add Coach Bodybuilding Transformation' : 'Edit Coach Transformation'}
              </h3>
              <button type="button" onClick={() => setMyTransModal({ isOpen: false, mode: 'create' })} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={myTransForm.title}
                  onChange={(e) => setMyTransForm({ ...myTransForm, title: e.target.value })}
                  placeholder="e.g. My Personal Bodybuilding Journey"
                  className="w-full bg-[#050507] border border-card-border rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Description / Story *</label>
                <textarea
                  rows={4}
                  required
                  value={myTransForm.story}
                  onChange={(e) => setMyTransForm({ ...myTransForm, story: e.target.value })}
                  placeholder="Describe your training splits and contest prep details..."
                  className="w-full bg-[#050507] border border-card-border rounded-xl p-3 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-gray-400 font-bold">Before Image *</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={myTransForm.before_img_url}
                      onChange={(e) => setMyTransForm({ ...myTransForm, before_img_url: e.target.value })}
                      placeholder="URL or pick..."
                      className="flex-1 bg-[#050507] border border-card-border rounded-xl px-2 py-1 text-white text-[10px]"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaPicker({
                        isOpen: true,
                        onSelect: (url) => setMyTransForm({ ...myTransForm, before_img_url: url })
                      })}
                      className="px-2 py-1 bg-card-bg border border-gold/40 text-gold rounded-xl text-[10px] font-bold"
                    >
                      Pick
                    </button>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setMyTransForm({ ...myTransForm, before_file: e.target.files?.[0] || null })}
                    className="text-xs text-gray-400 file:mr-1 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[9px] file:font-bold file:bg-card-bg file:text-gold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-gray-400 font-bold">After (Front) *</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={myTransForm.after_img_url}
                      onChange={(e) => setMyTransForm({ ...myTransForm, after_img_url: e.target.value })}
                      placeholder="URL or pick..."
                      className="flex-1 bg-[#050507] border border-card-border rounded-xl px-2 py-1 text-white text-[10px]"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaPicker({
                        isOpen: true,
                        onSelect: (url) => setMyTransForm({ ...myTransForm, after_img_url: url })
                      })}
                      className="px-2 py-1 bg-card-bg border border-gold/40 text-gold rounded-xl text-[10px] font-bold"
                    >
                      Pick
                    </button>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setMyTransForm({ ...myTransForm, after_file: e.target.files?.[0] || null })}
                    className="text-xs text-gray-400 file:mr-1 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[9px] file:font-bold file:bg-card-bg file:text-gold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-gray-400 font-bold">After (Side)</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={myTransForm.after_img_2_url}
                      onChange={(e) => setMyTransForm({ ...myTransForm, after_img_2_url: e.target.value })}
                      placeholder="URL or pick..."
                      className="flex-1 bg-[#050507] border border-card-border rounded-xl px-2 py-1 text-white text-[10px]"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaPicker({
                        isOpen: true,
                        onSelect: (url) => setMyTransForm({ ...myTransForm, after_img_2_url: url })
                      })}
                      className="px-2 py-1 bg-card-bg border border-gold/40 text-gold rounded-xl text-[10px] font-bold"
                    >
                      Pick
                    </button>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setMyTransForm({ ...myTransForm, after_file_2: e.target.files?.[0] || null })}
                    className="text-xs text-gray-400 file:mr-1 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[9px] file:font-bold file:bg-card-bg file:text-gold"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="m_pub"
                  checked={myTransForm.is_published}
                  onChange={(e) => setMyTransForm({ ...myTransForm, is_published: e.target.checked })}
                  className="rounded border-card-border text-gold focus:ring-gold"
                />
                <label htmlFor="m_pub" className="text-gray-300 font-bold cursor-pointer">Publish immediately on website</label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-card-border">
              <button
                type="button"
                onClick={() => setMyTransModal({ isOpen: false, mode: 'create' })}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-300 bg-card-bg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-black gold-gradient-bg shadow-lg"
              >
                Save Transformation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TRANSFORMATION VIDEO MODAL */}
      {videoModal.isOpen && (
        <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveVideo} className="bg-[#0e1017] border border-gold/40 rounded-3xl p-8 max-w-xl w-full space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-card-border pb-4">
              <h3 className="text-lg font-extrabold text-white">
                {videoModal.mode === 'create' ? 'Upload Transformation Video' : 'Edit Transformation Video'}
              </h3>
              <button type="button" onClick={() => setVideoModal({ isOpen: false, mode: 'create' })} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Video Title *</label>
                <input
                  type="text"
                  required
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  placeholder="e.g. 12-Week Fat Loss Walkthrough"
                  className="w-full bg-[#050507] border border-card-border rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 font-bold">Video File (MP4/WebM) *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={videoForm.video_url}
                    onChange={(e) => setVideoForm({ ...videoForm, video_url: e.target.value })}
                    placeholder="Video URL or pick from media library..."
                    className="flex-1 bg-[#050507] border border-card-border rounded-xl px-3 py-1.5 text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaPicker({
                      isOpen: true,
                      onSelect: (url) => setVideoForm({ ...videoForm, video_url: url })
                    })}
                    className="px-3 py-1.5 bg-card-bg border border-gold/40 text-gold rounded-xl text-xs font-bold shrink-0"
                  >
                    Pick
                  </button>
                </div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoForm({ ...videoForm, video_file: e.target.files?.[0] || null })}
                  className="text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-card-bg file:text-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 font-bold">Thumbnail Image (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={videoForm.thumbnail_url}
                    onChange={(e) => setVideoForm({ ...videoForm, thumbnail_url: e.target.value })}
                    placeholder="Thumbnail URL or pick..."
                    className="flex-1 bg-[#050507] border border-card-border rounded-xl px-3 py-1.5 text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaPicker({
                      isOpen: true,
                      onSelect: (url) => setVideoForm({ ...videoForm, thumbnail_url: url })
                    })}
                    className="px-3 py-1.5 bg-card-bg border border-gold/40 text-gold rounded-xl text-xs font-bold shrink-0"
                  >
                    Pick
                  </button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setVideoForm({ ...videoForm, thumbnail_file: e.target.files?.[0] || null })}
                  className="text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-card-bg file:text-gold"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="v_pub"
                  checked={videoForm.is_published}
                  onChange={(e) => setVideoForm({ ...videoForm, is_published: e.target.checked })}
                  className="rounded border-card-border text-gold focus:ring-gold"
                />
                <label htmlFor="v_pub" className="text-gray-300 font-bold cursor-pointer">Publish immediately on website</label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-card-border">
              <button
                type="button"
                onClick={() => setVideoModal({ isOpen: false, mode: 'create' })}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-300 bg-card-bg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-black gold-gradient-bg shadow-lg"
              >
                Save Video
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MEDIA PICKER MODAL OVERLAY */}
      {mediaPicker.isOpen && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e1017] border border-gold/50 rounded-3xl p-6 max-w-3xl w-full space-y-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-card-border pb-4">
              <div className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5 text-gold" />
                <h3 className="text-lg font-extrabold text-white">Select from Media Library</h3>
              </div>
              <button
                type="button"
                onClick={() => setMediaPicker({ ...mediaPicker, isOpen: false })}
                className="text-gray-400 hover:text-white text-sm font-bold bg-card-bg px-3 py-1 rounded-full border border-card-border"
              >
                Close (✕)
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-2">
              {mediaFiles.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  No uploaded media assets found. Upload images or videos in the Media Library tab first.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mediaFiles.map((file) => {
                    const isImg = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                    return (
                      <div
                        key={file.name}
                        onClick={() => {
                          mediaPicker.onSelect(file.url);
                          setMediaPicker({ ...mediaPicker, isOpen: false });
                          showToast('success', `Selected media: ${file.name}`);
                        }}
                        className="glass-panel p-3 rounded-2xl border border-card-border hover:border-gold cursor-pointer transition-all duration-300 group flex flex-col items-center justify-between text-center space-y-2 hover:scale-105"
                      >
                        <div className="h-24 w-full rounded-xl overflow-hidden bg-black/50 flex items-center justify-center">
                          {isImg ? (
                            <img src={resolveMediaUrl(file.url)} alt={file.name} className="h-full w-full object-cover" />
                          ) : (
                            <Film className="h-8 w-8 text-gold" />
                          )}
                        </div>
                        <p className="text-[10px] text-gray-300 font-bold truncate w-full group-hover:text-gold">{file.name}</p>
                        <span className="text-[9px] text-black gold-gradient-bg px-2 py-0.5 rounded-full font-extrabold">Select</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
