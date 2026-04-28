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
import { auth as authService } from '../services/auth';
import { motion, AnimatePresence } from 'motion/react';

interface TaskBoardProps {
  tasks: Task[];
  onUpdate: () => void;
}

export default function TaskBoard({ tasks, onUpdate }: TaskBoardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as Task['priority'] });
  const user = authService.getUser();

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      ...newTask,
      status: 'pending',
      createdBy: user.name,
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
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl self-start">
          {(['all', 'pending', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-white text-[#4A773C] shadow-sm' : 'hover:bg-gray-200 text-gray-500'
              }`}
            >
              {f}
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
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-4">
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
                      Save Handover
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
                <button 
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`mt-1 transition-all transform active:scale-90 ${
                    task.status === 'completed' ? 'text-[#88C13E]' : 'text-gray-300 hover:text-[#4A773C]'
                  }`}
                >
                  {task.status === 'completed' ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className={`font-bold text-xl leading-tight transition-all truncate tracking-tight text-gray-900 ${
                      task.status === 'completed' ? 'line-through text-gray-400' : ''
                    }`}>
                      {task.title}
                    </h4>
                    <span className={`shrink-0 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] border ${
                      task.priority === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                      task.priority === 'medium' ? 'bg-[#4A773C]/10 text-[#4A773C] border-[#4A773C]/20' : 
                      'bg-[#88C13E]/10 text-[#88C13E] border-[#88C13E]/20'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed italic line-clamp-2">"{task.description}"</p>
                  
                  <div className="flex items-center gap-5 mt-6 pt-5 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#4A773C]/10 border border-[#4A773C]/20 flex items-center justify-center text-[10px] font-black text-[#4A773C]">
                        {authService.getInitials(task.createdBy)}
                      </div>
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{task.createdBy}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Logged {new Date(task.createdAt).toLocaleDateString()}</span>
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
