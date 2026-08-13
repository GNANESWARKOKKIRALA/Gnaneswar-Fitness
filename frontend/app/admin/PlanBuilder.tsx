'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Dumbbell, Apple, Clock, Layers, Flame } from 'lucide-react';

interface PlanBuilderProps {
  type: string; // 'workout' or 'diet'
  value: string; // JSON string
  onChange: (value: string) => void;
}

export default function PlanBuilder({ type, value, onChange }: PlanBuilderProps) {
  // If parsing fails, fall back to basic structure
  const [data, setData] = useState<any[]>(() => {
    try {
      if (value) return JSON.parse(value);
    } catch (e) {}
    return type === 'workout' 
      ? [{ day: "Day 1", focus: "", exercises: [] }]
      : [{ day: "Day 1", meals: [] }];
  });

  // Keep parent in sync
  useEffect(() => {
    onChange(JSON.stringify(data, null, 2));
  }, [data]);

  // Reset when type changes
  useEffect(() => {
    try {
        if(value && JSON.parse(value).length > 0) return;
    } catch(e) {}
    
    setData(type === 'workout' 
      ? [{ day: "Day 1", focus: "", exercises: [] }]
      : [{ day: "Day 1", meals: [] }]
    );
  }, [type]);


  // WORKOUT SPECIFIC
  const addExercise = (dayIdx: number) => {
    const newData = [...data];
    newData[dayIdx].exercises.push({ name: '', sets: 4, reps: '10', weight: '', rest: '60s' });
    setData(newData);
  };

  const removeExercise = (dayIdx: number, exIdx: number) => {
    const newData = [...data];
    newData[dayIdx].exercises.splice(exIdx, 1);
    setData(newData);
  };

  const updateExercise = (dayIdx: number, exIdx: number, field: string, val: any) => {
    const newData = [...data];
    newData[dayIdx].exercises[exIdx][field] = val;
    setData(newData);
  };

  // DIET SPECIFIC
  const addMeal = (dayIdx: number) => {
    const newData = [...data];
    newData[dayIdx].meals.push({ name: '', items: '', protein: 0, carbs: 0, fats: 0 });
    setData(newData);
  };

  const removeMeal = (dayIdx: number, mealIdx: number) => {
    const newData = [...data];
    newData[dayIdx].meals.splice(mealIdx, 1);
    setData(newData);
  };

  const updateMeal = (dayIdx: number, mealIdx: number, field: string, val: any) => {
    const newData = [...data];
    newData[dayIdx].meals[mealIdx][field] = field === 'name' || field === 'items' ? val : Number(val);
    setData(newData);
  };

  // COMMON
  const addDay = () => {
    setData([...data, type === 'workout' 
      ? { day: `Day ${data.length + 1}`, focus: "", exercises: [] }
      : { day: `Day ${data.length + 1}`, meals: [] }
    ]);
  };

  const removeDay = (dayIdx: number) => {
    const newData = [...data];
    newData.splice(dayIdx, 1);
    setData(newData);
  };

  const updateDay = (dayIdx: number, field: string, val: string) => {
    const newData = [...data];
    newData[dayIdx][field] = val;
    setData(newData);
  };

  return (
    <div className="space-y-6 mt-4">
      {data.map((dayItem, dayIdx) => (
        <div key={dayIdx} className="bg-[#111820] border border-[#1C2329] p-5 rounded-2xl relative group">
          <button 
            type="button"
            onClick={() => removeDay(dayIdx)}
            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          
          <div className="flex gap-4 mb-6 pr-10">
            <input 
              className="bg-transparent text-xl font-bold font-bebas tracking-wider text-[#00BFFF] border-b border-[#333] focus:border-[#00BFFF] focus:outline-none px-1 w-32"
              value={dayItem.day}
              onChange={(e) => updateDay(dayIdx, 'day', e.target.value)}
              placeholder="e.g. Day 1"
            />
            {type === 'workout' && (
              <input 
                className="bg-transparent text-gray-300 border-b border-[#333] focus:border-[#00BFFF] focus:outline-none px-2 flex-1"
                value={dayItem.focus || ''}
                onChange={(e) => updateDay(dayIdx, 'focus', e.target.value)}
                placeholder="Muscle Focus (e.g. Chest & Triceps)"
              />
            )}
          </div>

          {type === 'workout' ? (
            <div className="space-y-3">
              {dayItem.exercises.map((ex: any, exIdx: number) => (
                <div key={exIdx} className="flex flex-wrap gap-2 items-center bg-[#050505] p-3 rounded-xl border border-[#1C2329]">
                  <input 
                    className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder-gray-600 min-w-[150px]"
                    placeholder="Exercise Name"
                    value={ex.name} onChange={(e) => updateExercise(dayIdx, exIdx, 'name', e.target.value)}
                  />
                  <div className="flex items-center gap-1 bg-[#111820] px-2 py-1 rounded-md border border-[#333]">
                    <Layers className="w-3 h-3 text-gray-500" />
                    <input 
                      type="number" className="w-10 bg-transparent text-xs text-white focus:outline-none text-center"
                      value={ex.sets} onChange={(e) => updateExercise(dayIdx, exIdx, 'sets', e.target.value)}
                    />
                    <span className="text-xs text-gray-500">sets</span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#111820] px-2 py-1 rounded-md border border-[#333]">
                    <span className="text-xs text-gray-500">reps</span>
                    <input 
                      type="text" className="w-12 bg-transparent text-xs text-white focus:outline-none text-center"
                      value={ex.reps} onChange={(e) => updateExercise(dayIdx, exIdx, 'reps', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-[#111820] px-2 py-1 rounded-md border border-[#333]">
                    <Dumbbell className="w-3 h-3 text-gray-500" />
                    <input 
                      type="text" className="w-16 bg-transparent text-xs text-white focus:outline-none text-center" placeholder="wt (kg)"
                      value={ex.weight || ''} onChange={(e) => updateExercise(dayIdx, exIdx, 'weight', e.target.value)}
                    />
                  </div>
                  <button type="button" onClick={() => removeExercise(dayIdx, exIdx)} className="text-gray-600 hover:text-red-500 ml-2">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => addExercise(dayIdx)}
                className="text-xs text-[#00BFFF] hover:text-white flex items-center gap-1 mt-2"
              >
                <Plus className="w-3 h-3" /> Add Exercise
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {dayItem.meals.map((meal: any, mIdx: number) => (
                <div key={mIdx} className="flex flex-col gap-2 bg-[#050505] p-3 rounded-xl border border-[#1C2329]">
                  <div className="flex items-center gap-2">
                    <input 
                      className="bg-transparent font-bold text-sm text-[#00BFFF] focus:outline-none w-32"
                      placeholder="e.g. Breakfast"
                      value={meal.name} onChange={(e) => updateMeal(dayIdx, mIdx, 'name', e.target.value)}
                    />
                    <input 
                      className="flex-1 bg-transparent text-sm text-gray-300 focus:outline-none"
                      placeholder="e.g. 2 Whole Eggs, 100g Oats"
                      value={meal.items} onChange={(e) => updateMeal(dayIdx, mIdx, 'items', e.target.value)}
                    />
                    <button type="button" onClick={() => removeMeal(dayIdx, mIdx)} className="text-gray-600 hover:text-red-500 ml-2">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-4 text-xs mt-1 border-t border-[#1C2329] pt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">PRO (g)</span>
                      <input type="number" className="w-12 bg-[#111820] text-center rounded border border-[#333]" value={meal.protein} onChange={(e) => updateMeal(dayIdx, mIdx, 'protein', e.target.value)} />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">CARB (g)</span>
                      <input type="number" className="w-12 bg-[#111820] text-center rounded border border-[#333]" value={meal.carbs} onChange={(e) => updateMeal(dayIdx, mIdx, 'carbs', e.target.value)} />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">FAT (g)</span>
                      <input type="number" className="w-12 bg-[#111820] text-center rounded border border-[#333]" value={meal.fats} onChange={(e) => updateMeal(dayIdx, mIdx, 'fats', e.target.value)} />
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      <Flame className="w-3 h-3 text-orange-500" />
                      <span className="text-gray-400 font-bold">
                        {(meal.protein * 4) + (meal.carbs * 4) + (meal.fats * 9)} kcal
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => addMeal(dayIdx)}
                className="text-xs text-[#00BFFF] hover:text-white flex items-center gap-1 mt-2"
              >
                <Plus className="w-3 h-3" /> Add Meal
              </button>
            </div>
          )}
        </div>
      ))}
      
      <button 
        type="button" 
        onClick={addDay}
        className="w-full border border-dashed border-[#333] hover:border-[#00BFFF] text-gray-500 hover:text-[#00BFFF] py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors font-bold text-sm"
      >
        <Plus className="w-4 h-4" /> Add Another Day
      </button>
    </div>
  );
}
