/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  CheckCircle2, 
  Circle,
  AlertTriangle,
  ChevronDown,
  ClipboardList
} from 'lucide-react';
import { Task } from '../types';
import { storage } from '../services/storage';
import { motion, AnimatePresence } from 'motion/react';

interface TaskBoardProps {
  tasks: Task[];
  onUpdate: () => void;
}

export default function TaskBoard({ tasks, onUpdate }: TaskBoardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as Task['priority'] });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      ...newTask,
      status: 'pending',
      createdBy: 'John Arellano',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const currentTasks = storage.getTasks();
    storage.saveTasks([task, ...currentTasks]);
    setNewTask({ title: '', description: '', priority: 'medium' });
    setIsAdding(false);
    onUpdate();
  };

  const toggleTaskStatus = (id: string) => {
    const currentTasks = storage.getTasks();
    const updated = currentTasks.map(t => {
      if (t.id === id) {
        const nextStatus: Task['status'] = t.status === 'completed' ? 'pending' : 'completed';
        return { 
          ...t, 
          status: nextStatus,
          updatedAt: Date.now()
        };
      }
      return t;
    });
    storage.saveTasks(updated);
    onUpdate();
  };

  const deleteTask = (id: string) => {
    const currentTasks = storage.getTasks();
    const filtered = currentTasks.filter(t => t.id !== id);
    storage.saveTasks(filtered);
    onUpdate();
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'pending') return t.status !== 'completed';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 glass p-1.5 rounded-2xl self-start">
          {(['all', 'pending', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-white/20 text-white shadow-inner' : 'hover:bg-white/5 text-slate-500 hover:text-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
        >
          <Plus size={20} />
          Create Entry
        </button>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass p-8 rounded-3xl border-indigo-500/50 shadow-2xl shadow-indigo-500/10"
            >
              <form onSubmit={handleAddTask} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Requirement Title</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    placeholder="E.g. Database patch deployment..."
                    className="w-full text-2xl font-black bg-transparent border-none outline-none focus:ring-0 p-0 placeholder:text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Terminal Instructions</label>
                  <textarea 
                    value={newTask.description}
                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Provide full context for the incoming officer..."
                    className="w-full bg-white/5 rounded-2xl p-5 text-sm text-slate-300 border border-white/5 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] transition-all"
                  />
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-4">
                    <select 
                      value={newTask.priority}
                      onChange={e => setNewTask({...newTask, priority: e.target.value as Task['priority']})}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none text-slate-300 focus:bg-white/10"
                    >
                      <option value="low" className="bg-slate-900">Low Priority</option>
                      <option value="medium" className="bg-slate-900">Medium Priority</option>
                      <option value="high" className="bg-slate-900">High Priority</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      Discard
                    </button>
                    <button 
                      type="submit"
                      className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                    >
                      Append Entry
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <motion.div
                layout
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group glass-card hover:bg-white/10 transition-all flex items-start gap-6 ${
                  task.status === 'completed' ? 'opacity-40' : ''
                }`}
              >
                <button 
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`mt-1 transition-all transform active:scale-90 ${
                    task.status === 'completed' ? 'text-emerald-500' : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  {task.status === 'completed' ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className={`font-bold text-xl leading-tight transition-all truncate tracking-tight ${
                      task.status === 'completed' ? 'line-through text-slate-500' : ''
                    }`}>
                      {task.title}
                    </h4>
                    <span className={`shrink-0 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] border ${
                      task.priority === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 
                      task.priority === 'medium' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 
                      'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed italic line-clamp-2">"{task.description}"</p>
                  
                  <div className="flex items-center gap-5 mt-6 pt-5 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-300">
                        {task.createdBy[0]}
                      </div>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{task.createdBy}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Logged {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-32 text-center text-slate-700">
              <ClipboardList size={80} className="mx-auto mb-6 opacity-5" />
              <p className="font-black text-2xl tracking-tighter italic">Terminal Clear</p>
              <p className="text-sm uppercase tracking-[0.2em] mt-2">Zero open requirements on current matrix</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
