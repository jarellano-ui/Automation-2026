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
  Clock,
  AlertTriangle,
  ChevronDown,
  ClipboardList
} from 'lucide-react';
import { Task } from '../types';
import { storage } from '../services/storage';
import { auth as authService } from '../services/auth';
import { motion, AnimatePresence } from 'motion/react';
import { IT_TEAM } from '../constants';

interface TaskBoardProps {
  tasks: Task[];
  onUpdate: () => void;
}

export default function TaskBoard({ tasks, onUpdate }: TaskBoardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'on-going' | 'completed'>('all');
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: 'medium' as Task['priority'],
    assignedTo: [] as string[] 
  });
  const user = authService.getUser();

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      assignedTo: newTask.assignedTo.length > 0 ? newTask.assignedTo : undefined,
      status: 'pending',
      createdBy: user.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.saveTasks([task, ...tasks]);
    setNewTask({ title: '', description: '', priority: 'medium', assignedTo: [] });
    setIsAdding(false);
    onUpdate();
  };

  const toggleTaskStatus = async (id: string, targetStatus?: Task['status']) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        if (t.status === 'completed') return t; // Locked

        let nextStatus: Task['status'] = t.status === 'pending' ? 'on-going' : 'completed';
        if (targetStatus) nextStatus = targetStatus;
        
        const now = Date.now();
        const updates: Partial<Task> = { 
          status: nextStatus,
          updatedAt: now
        };

        if (nextStatus === 'on-going' && !t.startedAt) {
          updates.startedAt = now;
        }

        if (nextStatus === 'completed' && !t.completedAt) {
          updates.completedAt = now;
        }

        if (nextStatus === 'pending') {
          // If moving back to pending, we don't necessarily reset startedAt 
          // unless we want to restart the SLA timer. 
          // User said "once completed it will not revert", but didn't say reset SLA on pause.
          // Usually SLA is cumulative or just from first start.
        }
        
        return { ...t, ...updates };
      }
      return t;
    });
    await storage.saveTasks(updated);
    onUpdate();
  };

  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const deleteTask = async (id: string) => {
    const filtered = tasks.filter(t => t.id !== id);
    await storage.saveTasks(filtered);
    onUpdate();
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return t.status !== 'completed';
    return t.status === filter;
  });

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl self-start">
          {(['all', 'pending', 'on-going', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-white text-[#4A773C] shadow-sm' : 'hover:bg-gray-200 text-gray-500'
              }`}
            >
              {f === 'on-going' ? 'Ongoing' : f}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 bg-[#4A773C] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#88C13E] transition-all shadow-xl shadow-[#4A773C]/20"
        >
          <Plus size={20} />
          Add Task
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
              className="hc-card p-8 border-l-4 border-l-[#88C13E] shadow-xl"
            >
              <form onSubmit={handleAddTask} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Task Title</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    placeholder="E.g. Device deployment..."
                    className="w-full text-2xl font-black bg-transparent border-none outline-none focus:ring-0 p-0 placeholder:text-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Description</label>
                  <textarea 
                    value={newTask.description}
                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Provide full context for the incoming officer..."
                    className="w-full bg-gray-50 rounded-2xl p-5 text-sm text-gray-700 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-[#88C13E] outline-none min-h-[120px] transition-all"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between pt-4 gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest pl-1">Priority</label>
                      <select 
                        value={newTask.priority}
                        onChange={e => setNewTask({...newTask, priority: e.target.value as Task['priority']})}
                        className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none text-gray-600 focus:bg-white focus:ring-2 focus:ring-[#88C13E]"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest pl-1">Assign To</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {IT_TEAM.map(name => {
                          const isSelected = newTask.assignedTo.includes(name);
                          return (
                            <button
                              key={name}
                              type="button"
                              onClick={() => {
                                const next = isSelected 
                                  ? newTask.assignedTo.filter(n => n !== name)
                                  : [...newTask.assignedTo, name];
                                setNewTask({ ...newTask, assignedTo: next });
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                                isSelected 
                                  ? 'bg-[#88C13E] text-white border-[#88C13E] shadow-sm' 
                                  : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
                              }`}
                            >
                              {name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Discard
                    </button>
                    <button 
                      type="submit"
                      className="bg-[#4A773C] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-[#4A773C]/20 active:scale-95 transition-all"
                    >
                      Submit
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
                className={`group hc-card p-6 transition-all flex items-start gap-6 hover:shadow-md hover:border-[#88C13E]/30 ${
                  task.status === 'completed' ? 'opacity-50' : ''
                }`}
              >
                <div className="flex flex-col gap-1 items-center">
                  <button 
                    onClick={() => toggleTaskStatus(task.id)}
                    disabled={task.status === 'completed'}
                    className={`mt-1 transition-all transform active:scale-90 ${
                      task.status === 'completed' ? 'text-[#88C13E] cursor-not-allowed' : 
                      task.status === 'on-going' ? 'text-blue-500 hover:text-blue-600' :
                      'text-orange-500 hover:text-orange-600'
                    }`}
                    title={task.status === 'completed' ? 'Task Completed' : task.status === 'on-going' ? 'Mark as Completed' : 'Start Task'}
                  >
                    {task.status === 'completed' ? <CheckCircle2 size={28} /> : 
                     task.status === 'on-going' ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}><Clock size={28} /></motion.div> : 
                     <Circle size={28} />}
                  </button>
                  
                  {task.status === 'on-going' && (
                    <button
                      onClick={() => toggleTaskStatus(task.id, 'pending')}
                      className="text-[9px] font-black uppercase text-gray-400 hover:text-rose-500 transition-colors"
                      title="Move back to Pending"
                    >
                      Pause
                    </button>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className={`font-bold text-xl leading-tight transition-all truncate tracking-tight text-gray-900 ${
                      task.status === 'completed' ? 'line-through text-gray-400' : ''
                    }`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                        task.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        task.status === 'on-going' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>
                        {task.status === 'on-going' ? 'Ongoing' : task.status}
                      </span>
                      <span className={`shrink-0 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] border ${
                        task.priority === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                        task.priority === 'medium' ? 'bg-[#4A773C]/10 text-[#4A773C] border-[#4A773C]/20' : 
                        'bg-[#88C13E]/10 text-[#88C13E] border-[#88C13E]/20'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed italic line-clamp-2">"{task.description}"</p>
                  
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-6 pt-5 border-t border-gray-50">
                    <div className="flex flex-col gap-1">
                      <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Created By</p>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#4A773C]/10 border border-[#4A773C]/20 flex items-center justify-center text-[10px] font-black text-[#4A773C]">
                          {authService.getInitials(task.createdBy)}
                        </div>
                        <span className="text-[10px] text-gray-900 font-black uppercase tracking-widest">{task.createdBy}</span>
                      </div>
                    </div>

                    {task.assignedTo && (Array.isArray(task.assignedTo) ? task.assignedTo.length > 0 : task.assignedTo) && (
                      <div className="flex flex-col gap-1">
                        <p className="text-[8px] font-black uppercase text-[#88C13E] tracking-widest leading-none mb-1">Assigned To</p>
                        <div className="flex flex-wrap items-center gap-3">
                          {(Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo]).map(assigned => (
                            <div key={assigned} className="flex items-center gap-2 bg-[#88C13E]/5 px-2 py-1 rounded-lg border border-[#88C13E]/10">
                              <div className="w-5 h-5 rounded-full bg-[#88C13E]/10 flex items-center justify-center text-[8px] font-black text-[#88C13E]">
                                {authService.getInitials(assigned)}
                              </div>
                              <span className="text-[10px] text-gray-900 font-black uppercase tracking-widest">{assigned}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-1">
                       <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Created</p>
                       <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                         {new Date(task.createdAt).toLocaleDateString()} {formatTime(task.createdAt)}
                       </span>
                    </div>

                    {task.startedAt && (
                      <div className="flex items-center gap-2">
                         <div className="w-1 h-1 rounded-full bg-blue-300"></div>
                         <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">
                           SLA: {formatDuration((task.completedAt || Date.now()) - task.startedAt)}
                         </span>
                      </div>
                    )}

                    {task.completedAt && (
                      <div className="flex items-center gap-2">
                         <div className="w-1 h-1 rounded-full bg-emerald-300"></div>
                         <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">
                           Done: {formatTime(task.completedAt)}
                         </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-32 text-center text-gray-400">
              <ClipboardList size={80} className="mx-auto mb-6 opacity-20" />
              <p className="font-black text-2xl tracking-tighter italic text-gray-600">Terminal Clear</p>
              <p className="text-sm uppercase tracking-[0.2em] mt-2">Zero open requirements on current matrix</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
