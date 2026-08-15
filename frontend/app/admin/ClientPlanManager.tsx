'use client';

import { useState, useEffect } from 'react';
import { Dumbbell, Apple, Calendar, Save, Plus, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface ClientPlanManagerProps {
  clientId: number;
  onClose: () => void;
}

export default function ClientPlanManager({ clientId, onClose }: ClientPlanManagerProps) {
  const [activeTab, setActiveTab] = useState<'workouts' | 'diets' | 'schedule'>('workouts');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Workouts State
  const [workouts, setWorkouts] = useState<any[]>([]);
  
  // Diets State
  const [diets, setDiets] = useState<any[]>([]);
  
  // Schedule State
  const [schedule, setSchedule] = useState<any>({
    water_target_ml: 3000,
    sleep_target_hrs: 8,
    cardio_target: '',
    steps_target: 10000,
    supplements: '',
    daily_instructions: ''
  });

  useEffect(() => {
    fetchPlans();
  }, [clientId, activeTab]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      if (activeTab === 'workouts') {
        const data = await apiFetch(`/api/client-plans/${clientId}/workouts`);
        setWorkouts(data || []);
      } else if (activeTab === 'diets') {
        const data = await apiFetch(`/api/client-plans/${clientId}/diets`);
        setDiets(data || []);
      } else if (activeTab === 'schedule') {
        const data = await apiFetch(`/api/client-plans/${clientId}/schedule`);
        if (data) setSchedule(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      if (activeTab === 'workouts') {
        await apiFetch(`/api/client-plans/${clientId}/workouts`, {
          method: 'PUT',
          body: JSON.stringify(workouts)
        });
      } else if (activeTab === 'diets') {
        await apiFetch(`/api/client-plans/${clientId}/diets`, {
          method: 'PUT',
          body: JSON.stringify(diets)
        });
      } else if (activeTab === 'schedule') {
        await apiFetch(`/api/client-plans/${clientId}/schedule`, {
          method: 'PUT',
          body: JSON.stringify(schedule)
        });
      }
      alert('Saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save');
    }
    setSaveLoading(false);
  };

  // Workout Handlers
  const addWorkout = () => {
    setWorkouts([...workouts, { day_of_week: 'Monday', title: 'New Workout', exercises: [] }]);
  };
  const addExercise = (wIdx: number) => {
    const newWorkouts = [...workouts];
    // exercise_id is required, we use a dummy 1 for now if library is not fully integrated
    newWorkouts[wIdx].exercises.push({ exercise_id: 1, sets: '3', reps: '10', rest_time: '60s' });
    setWorkouts(newWorkouts);
  };

  // Diet Handlers
  const addDiet = () => {
    setDiets([...diets, { meal_time: 'Breakfast', display_order: diets.length, foods: [] }]);
  };
  const addFood = (dIdx: number) => {
    const newDiets = [...diets];
    newDiets[dIdx].foods.push({ diet_item_id: 1, quantity: '100g' });
    setDiets(newDiets);
  };

  return (
    <div className="bg-[#0B0F12] border border-[#1C2329] rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-[#1C2329] pb-4 mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          Manage Plan for Client
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">Close</button>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('workouts')}
          className={`px-4 py-2 rounded-xl font-bold text-sm ${activeTab === 'workouts' ? 'bg-[#00BFFF] text-black' : 'bg-[#1C2329] text-gray-400'}`}
        >
          <Dumbbell className="w-4 h-4 inline mr-2" /> Workouts
        </button>
        <button 
          onClick={() => setActiveTab('diets')}
          className={`px-4 py-2 rounded-xl font-bold text-sm ${activeTab === 'diets' ? 'bg-[#00BFFF] text-black' : 'bg-[#1C2329] text-gray-400'}`}
        >
          <Apple className="w-4 h-4 inline mr-2" /> Diet Plan
        </button>
        <button 
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-xl font-bold text-sm ${activeTab === 'schedule' ? 'bg-[#00BFFF] text-black' : 'bg-[#1C2329] text-gray-400'}`}
        >
          <Calendar className="w-4 h-4 inline mr-2" /> Schedule Targets
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading...</div>
        ) : (
          <>
            {activeTab === 'workouts' && (
              <div className="space-y-6">
                {workouts.map((w, wIdx) => (
                  <div key={wIdx} className="bg-[#050505] p-4 rounded-xl border border-[#1C2329]">
                    <div className="flex gap-4 mb-4">
                      <input 
                        className="bg-transparent text-[#00BFFF] font-bold border-b border-[#333] focus:border-[#00BFFF] outline-none"
                        value={w.day_of_week} onChange={(e) => { const n = [...workouts]; n[wIdx].day_of_week = e.target.value; setWorkouts(n); }}
                        placeholder="Day of Week"
                      />
                      <input 
                        className="bg-transparent text-white border-b border-[#333] focus:border-[#00BFFF] outline-none flex-1"
                        value={w.title} onChange={(e) => { const n = [...workouts]; n[wIdx].title = e.target.value; setWorkouts(n); }}
                        placeholder="Workout Title (e.g. Chest & Triceps)"
                      />
                      <button onClick={() => { const n = [...workouts]; n.splice(wIdx,1); setWorkouts(n); }} className="text-red-500 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {w.exercises.map((ex: any, eIdx: number) => (
                        <div key={eIdx} className="flex gap-2 items-center bg-[#111820] p-2 rounded-lg">
                          <span className="text-xs text-gray-500">Ex ID:</span>
                          <input 
                            type="number" className="w-16 bg-transparent text-white border-b border-[#333] outline-none text-xs" 
                            value={ex.exercise_id} onChange={(e) => { const n = [...workouts]; n[wIdx].exercises[eIdx].exercise_id = Number(e.target.value); setWorkouts(n); }}
                          />
                          <span className="text-xs text-gray-500">Sets:</span>
                          <input 
                            className="w-12 bg-transparent text-white border-b border-[#333] outline-none text-xs" 
                            value={ex.sets} onChange={(e) => { const n = [...workouts]; n[wIdx].exercises[eIdx].sets = e.target.value; setWorkouts(n); }}
                          />
                          <span className="text-xs text-gray-500">Reps:</span>
                          <input 
                            className="w-12 bg-transparent text-white border-b border-[#333] outline-none text-xs" 
                            value={ex.reps} onChange={(e) => { const n = [...workouts]; n[wIdx].exercises[eIdx].reps = e.target.value; setWorkouts(n); }}
                          />
                          <button onClick={() => { const n = [...workouts]; n[wIdx].exercises.splice(eIdx,1); setWorkouts(n); }} className="text-gray-500 hover:text-red-500 ml-auto">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addExercise(wIdx)} className="text-xs text-[#00BFFF] flex items-center gap-1 mt-2">
                        <Plus className="w-3 h-3" /> Add Exercise
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={addWorkout} className="w-full py-3 border border-dashed border-[#333] text-gray-400 hover:border-[#00BFFF] hover:text-[#00BFFF] rounded-xl flex justify-center items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Workout Day
                </button>
              </div>
            )}

            {activeTab === 'diets' && (
              <div className="space-y-6">
                {diets.map((d, dIdx) => (
                  <div key={dIdx} className="bg-[#050505] p-4 rounded-xl border border-[#1C2329]">
                    <div className="flex gap-4 mb-4">
                      <input 
                        className="bg-transparent text-[#00BFFF] font-bold border-b border-[#333] focus:border-[#00BFFF] outline-none"
                        value={d.meal_time} onChange={(e) => { const n = [...diets]; n[dIdx].meal_time = e.target.value; setDiets(n); }}
                        placeholder="Meal Time (e.g. Breakfast)"
                      />
                      <input 
                        className="bg-transparent text-white border-b border-[#333] focus:border-[#00BFFF] outline-none flex-1"
                        value={d.instructions || ''} onChange={(e) => { const n = [...diets]; n[dIdx].instructions = e.target.value; setDiets(n); }}
                        placeholder="Instructions"
                      />
                      <button onClick={() => { const n = [...diets]; n.splice(dIdx,1); setDiets(n); }} className="text-red-500 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {d.foods?.map((f: any, fIdx: number) => (
                        <div key={fIdx} className="flex gap-2 items-center bg-[#111820] p-2 rounded-lg">
                          <span className="text-xs text-gray-500">Food ID:</span>
                          <input 
                            type="number" className="w-16 bg-transparent text-white border-b border-[#333] outline-none text-xs" 
                            value={f.diet_item_id} onChange={(e) => { const n = [...diets]; n[dIdx].foods[fIdx].diet_item_id = Number(e.target.value); setDiets(n); }}
                          />
                          <span className="text-xs text-gray-500">Qty:</span>
                          <input 
                            className="w-20 bg-transparent text-white border-b border-[#333] outline-none text-xs" 
                            value={f.quantity} onChange={(e) => { const n = [...diets]; n[dIdx].foods[fIdx].quantity = e.target.value; setDiets(n); }}
                          />
                          <button onClick={() => { const n = [...diets]; n[dIdx].foods.splice(fIdx,1); setDiets(n); }} className="text-gray-500 hover:text-red-500 ml-auto">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addFood(dIdx)} className="text-xs text-[#00BFFF] flex items-center gap-1 mt-2">
                        <Plus className="w-3 h-3" /> Add Food Item
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={addDiet} className="w-full py-3 border border-dashed border-[#333] text-gray-400 hover:border-[#00BFFF] hover:text-[#00BFFF] rounded-xl flex justify-center items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Meal
                </button>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Water Target (ml)</label>
                  <input type="number" className="w-full bg-[#050505] p-3 rounded-lg border border-[#333] text-white" value={schedule.water_target_ml} onChange={e => setSchedule({...schedule, water_target_ml: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Sleep Target (hrs)</label>
                  <input type="number" className="w-full bg-[#050505] p-3 rounded-lg border border-[#333] text-white" value={schedule.sleep_target_hrs} onChange={e => setSchedule({...schedule, sleep_target_hrs: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Steps Target</label>
                  <input type="number" className="w-full bg-[#050505] p-3 rounded-lg border border-[#333] text-white" value={schedule.steps_target} onChange={e => setSchedule({...schedule, steps_target: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Cardio Target</label>
                  <input className="w-full bg-[#050505] p-3 rounded-lg border border-[#333] text-white" value={schedule.cardio_target || ''} onChange={e => setSchedule({...schedule, cardio_target: e.target.value})} placeholder="e.g. 20 min LISS" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Supplements</label>
                  <textarea className="w-full bg-[#050505] p-3 rounded-lg border border-[#333] text-white" rows={3} value={schedule.supplements || ''} onChange={e => setSchedule({...schedule, supplements: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Daily Instructions</label>
                  <textarea className="w-full bg-[#050505] p-3 rounded-lg border border-[#333] text-white" rows={3} value={schedule.daily_instructions || ''} onChange={e => setSchedule({...schedule, daily_instructions: e.target.value})} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="pt-4 border-t border-[#1C2329] mt-auto">
        <button 
          onClick={handleSave}
          disabled={saveLoading}
          className="w-full bg-[#00BFFF] text-black font-bold uppercase py-4 rounded-xl hover:bg-white transition-all disabled:opacity-50"
        >
          {saveLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
