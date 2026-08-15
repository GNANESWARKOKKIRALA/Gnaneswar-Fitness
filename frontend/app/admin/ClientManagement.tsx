'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { 
  Users, Check, X, Search, Edit, Trash2, Calendar, Activity, 
  ChevronRight, Dumbbell, Apple, Plus, ArrowLeft, CheckCircle2, AlertCircle
} from 'lucide-react';
import ClientPlanManager from './ClientPlanManager';

interface Client {
  id: number;
  email: string;
  name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

interface AssignedPlan {
  id: number;
  title: string;
  type: string;
  schedule_type: string;
  date_assigned: string;
}

interface DailyLog {
  id: number;
  date: string;
  workout_completed: boolean;
  meals_completed: number;
  water_intake_ml: number;
  notes: string;
  weight: number;
}

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Client Details Data
  const [clientPlans, setClientPlans] = useState<AssignedPlan[]>([]);
  const [clientLogs, setClientLogs] = useState<DailyLog[]>([]);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', password: '' });
  
  // Plan Assignment
  const [isAssignPlanOpen, setIsAssignPlanOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ 
    title: '', type: 'workout', date_assigned: '', content: '' 
  });
  
  const [actionMessage, setActionMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchClientDetails(selectedClient.id);
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    try {
      const res = await apiFetch('/api/admin/users');
      setClients(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientDetails = async (id: number) => {
    try {
      const [plans, logs] = await Promise.all([
        apiFetch(`/api/assignments/client/${id}`),
        apiFetch(`/api/logs/client/${id}`)
      ]);
      setClientPlans(plans || []);
      setClientLogs(logs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const showMessage = (type: 'success'|'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm)
      });
      showMessage('success', 'Client added successfully');
      setIsAddModalOpen(false);
      setAddForm({ name: '', email: '', phone: '', password: '' });
      fetchClients();
    } catch (err: any) {
      showMessage('error', err.message || 'Failed to add client');
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (!confirm('Are you sure you want to delete this client? All their data will be lost.')) return;
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      showMessage('success', 'Client deleted');
      if (selectedClient?.id === id) setSelectedClient(null);
      fetchClients();
    } catch (err: any) {
      showMessage('error', err.message || 'Failed to delete client');
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await apiFetch(`/api/admin/users/${id}/status`, { method: 'PUT' });
      fetchClients();
    } catch (err) {
      showMessage('error', 'Failed to update status');
    }
  };

  const handleAssignPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    try {
      await apiFetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedClient.id,
          title: assignForm.title,
          type: assignForm.type,
          schedule_type: 'daily',
          date_assigned: assignForm.date_assigned,
          content: assignForm.content
        })
      });
      showMessage('success', 'Plan assigned successfully');
      setIsAssignPlanOpen(false);
      setAssignForm({ title: '', type: 'workout', date_assigned: '', content: '' });
      fetchClientDetails(selectedClient.id);
    } catch (err: any) {
      showMessage('error', err.message || 'Failed to assign plan');
    }
  };

  const handleDeletePlan = async (planId: number) => {
    if (!confirm('Are you sure you want to remove this plan?')) return;
    try {
      await apiFetch(`/api/assignments/${planId}`, { method: 'DELETE' });
      showMessage('success', 'Plan removed');
      if (selectedClient) fetchClientDetails(selectedClient.id);
    } catch (err) {
      showMessage('error', 'Failed to remove plan');
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-gray-400 p-8 text-center animate-pulse">Loading Clients...</div>;

  // VIEW: Client Details
  if (selectedClient) {
    return (
      <div className="space-y-6 fade-in max-w-6xl mx-auto">
        {actionMessage && (
          <div className={`p-4 rounded-xl border ${actionMessage.type === 'success' ? 'bg-[#00BFFF]/10 border-[#00BFFF]/30 text-[#00BFFF]' : 'bg-red-500/10 border-red-500/30 text-red-500'} flex items-center gap-3`}>
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {actionMessage.text}
          </div>
        )}
        
        <div className="flex items-center gap-4 border-b border-[#1C2329] pb-6">
          <button 
            onClick={() => setSelectedClient(null)}
            className="p-2 hover:bg-[#1C2329] rounded-xl text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold font-bebas tracking-wider text-white">{selectedClient.name}</h2>
            <p className="text-gray-400 text-sm">{selectedClient.email} • {selectedClient.phone || 'No phone'}</p>
          </div>
          <div className="ml-auto flex gap-3">
            <button 
              onClick={() => setIsAssignPlanOpen(true)}
              className="px-6 py-2 bg-[#00BFFF] text-black font-bold uppercase rounded-full hover:bg-white transition-all shadow-[0_0_15px_rgba(0,191,255,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center gap-2 text-sm"
            >
              <Dumbbell className="w-4 h-4" /> Manage Workouts & Diets
            </button>
          </div>
        </div>

        {isAssignPlanOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#050505] border border-[#1C2329] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative">
              <ClientPlanManager 
                clientId={selectedClient.id} 
                onClose={() => setIsAssignPlanOpen(false)} 
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assigned Plans Panel */}
          <div className="bg-[#0B0F12] border border-[#1C2329] rounded-2xl p-6">
            <h3 className="text-xl font-bold font-bebas tracking-wider text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00BFFF]" /> Active Plans
            </h3>
            <div className="space-y-4">
              {clientPlans.length === 0 ? (
                <div className="text-gray-500 text-center py-8 bg-[#050505] rounded-xl border border-[#1C2329] border-dashed">
                  No plans assigned yet
                </div>
              ) : (
                clientPlans.map(plan => (
                  <div key={plan.id} className="bg-[#050505] border border-[#1C2329] rounded-xl p-4 flex justify-between items-start group hover:border-[#00BFFF]/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {plan.type === 'workout' ? <Dumbbell className="w-4 h-4 text-[#00BFFF]" /> : <Apple className="w-4 h-4 text-[#00BFFF]" />}
                        <span className="font-bold text-white">{plan.title}</span>
                      </div>
                      <p className="text-xs text-gray-500 capitalize">{plan.type} • {plan.schedule_type} • Assigned: {plan.date_assigned}</p>
                    </div>
                    <button 
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-gray-500 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Daily Logs Panel */}
          <div className="bg-[#0B0F12] border border-[#1C2329] rounded-2xl p-6">
            <h3 className="text-xl font-bold font-bebas tracking-wider text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#00BFFF]" /> Completion Logs
            </h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {clientLogs.length === 0 ? (
                <div className="text-gray-500 text-center py-8 bg-[#050505] rounded-xl border border-[#1C2329] border-dashed">
                  No logs recorded yet
                </div>
              ) : (
                clientLogs.map(log => (
                  <div key={log.id} className="bg-[#050505] border border-[#1C2329] rounded-xl p-4 hover:border-[#333] transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-gray-300">{log.date}</span>
                      {log.weight ? <span className="text-[#00BFFF] font-mono text-sm">{log.weight} kg</span> : null}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-3 rounded-lg border ${log.workout_completed ? 'bg-[#00BFFF]/10 border-[#00BFFF]/30' : 'bg-[#1C2329] border-transparent'}`}>
                        <div className="flex items-center gap-2 text-sm">
                          <Dumbbell className={`w-4 h-4 ${log.workout_completed ? 'text-[#00BFFF]' : 'text-gray-500'}`} />
                          <span className={log.workout_completed ? 'text-[#00BFFF]' : 'text-gray-500'}>
                            {log.workout_completed ? 'Workout Done' : 'No Workout'}
                          </span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg border ${log.meals_completed > 0 ? 'bg-[#00BFFF]/10 border-[#00BFFF]/30' : 'bg-[#1C2329] border-transparent'}`}>
                        <div className="flex items-center gap-2 text-sm">
                          <Apple className={`w-4 h-4 ${log.meals_completed > 0 ? 'text-[#00BFFF]' : 'text-gray-500'}`} />
                          <span className={log.meals_completed > 0 ? 'text-[#00BFFF]' : 'text-gray-500'}>
                            {log.meals_completed} Meals Logged
                          </span>
                        </div>
                      </div>
                    </div>
                    {log.notes && (
                      <p className="mt-3 text-sm text-gray-400 bg-[#111820] p-3 rounded-lg border border-[#1C2329]">
                        "{log.notes}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    );
  }

  // VIEW: Clients List
  return (
    <div className="space-y-6 fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-bebas tracking-wider text-white">Client Management</h2>
          <p className="text-gray-400">Manage your athletes, track progress, and assign schedules.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-[#00BFFF] text-black font-bold uppercase rounded-full hover:bg-white transition-all shadow-[0_0_15px_rgba(0,191,255,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Client
        </button>
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-xl border ${actionMessage.type === 'success' ? 'bg-[#00BFFF]/10 border-[#00BFFF]/30 text-[#00BFFF]' : 'bg-red-500/10 border-red-500/30 text-red-500'} flex items-center gap-3`}>
          {actionMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {actionMessage.text}
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-[#0B0F12] p-4 rounded-2xl border border-[#1C2329] flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text"
            placeholder="Search clients by name or email..."
            className="w-full bg-[#050505] border border-[#1C2329] rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#00BFFF] transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-[#0B0F12] border border-[#1C2329] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#111820] border-b border-[#1C2329]">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2329]">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No clients found.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-[#111820]/50 transition-colors cursor-pointer" onClick={() => setSelectedClient(client)}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1C2329] flex items-center justify-center border border-[#333]">
                          <Users className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="font-bold text-white text-lg">{client.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      <div className="text-sm">{client.email}</div>
                      <div className="text-xs text-gray-500">{client.phone || '-'}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-sm">
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleToggleStatus(client.id)}
                        className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                          client.is_active ? 'bg-[#00BFFF]/20 text-[#00BFFF]' : 'bg-red-500/20 text-red-500'
                        }`}
                      >
                        {client.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedClient(client)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-[#1C2329] rounded-lg transition-colors"
                          title="Manage Plans"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Client"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0F12] border border-[#1C2329] rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold font-bebas tracking-wider text-white">Add New Client</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  type="text" required
                  className="w-full bg-[#050505] border border-[#1C2329] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00BFFF] transition-colors"
                  value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" required
                  className="w-full bg-[#050505] border border-[#1C2329] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00BFFF] transition-colors"
                  value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone (Optional)</label>
                <input 
                  type="text" 
                  className="w-full bg-[#050505] border border-[#1C2329] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00BFFF] transition-colors"
                  value={addForm.phone} onChange={e => setAddForm({...addForm, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Temporary Password</label>
                <input 
                  type="text" required
                  className="w-full bg-[#050505] border border-[#1C2329] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00BFFF] transition-colors"
                  value={addForm.password} onChange={e => setAddForm({...addForm, password: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-[#00BFFF] text-black font-bold uppercase py-4 rounded-xl hover:bg-white transition-all mt-4">
                Register Client
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
