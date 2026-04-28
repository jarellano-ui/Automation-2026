/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  ArrowRightLeft, 
  History, 
  Plus, 
  Search,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { View, Task, Handover } from './types';
import { storage } from './services/storage';

// Views
import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import HandoverForm from './components/HandoverForm';
import HandoverLogs from './components/HandoverLogs';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    setTasks(storage.getTasks());
    setHandovers(storage.getHandovers());
  }, []);

  const refreshData = () => {
    setTasks(storage.getTasks());
    setHandovers(storage.getHandovers());
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList },
    { id: 'handover', label: 'Endorse Shift', icon: ArrowRightLeft },
    { id: 'logs', label: 'Handover Logs', icon: History },
  ];

  return (
    <div className="flex h-screen bg-slate-900 font-sans text-slate-100 overflow-hidden relative">
      {/* Mesh Gradients */}
      <div className="mesh-gradient">
        <div className="mesh-1"></div>
        <div className="mesh-2"></div>
        <div className="mesh-3"></div>
      </div>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="glass border-r border-white/10 flex flex-col z-50 shrink-0 m-4 rounded-3xl"
      >
        <div className="p-6 flex items-center justify-between overflow-hidden">
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="font-bold text-xl tracking-tighter flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                SB
              </div>
              ShiftBridge
            </motion.div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-auto text-slate-400 hover:text-white"
          >
            {isSidebarOpen ? <Menu size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
                currentView === item.id 
                  ? 'bg-white/10 text-white border border-white/10 shadow-lg' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} className={currentView === item.id ? 'text-indigo-400' : ''} />
              {isSidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {item.label}
                </motion.span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className={`flex items-center gap-3 p-3 ${isSidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white/20 shrink-0" />
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
                <p className="font-semibold text-sm truncate">John Arellano</p>
                <p className="text-xs text-slate-400">Day Shift</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10 m-4">
        {/* Header */}
        <header className="h-20 glass border-none rounded-3xl px-8 flex items-center justify-between shrink-0 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-0.5">Shift Handover Protocol</p>
            <h2 className="text-xl font-bold tracking-tight">
              {navItems.find(n => n.id === currentView)?.label}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-white transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white focus:bg-white/10 focus:ring-2 focus:ring-indigo-500 outline-none w-64 transition-all"
              />
            </div>
            
            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            </button>
            
            <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* View Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto h-full"
            >
              {currentView === 'dashboard' && (
                <Dashboard tasks={tasks} handovers={handovers} onNavigate={setCurrentView} />
              )}
              {currentView === 'tasks' && (
                <TaskBoard tasks={tasks} onUpdate={refreshData} />
              )}
              {currentView === 'handover' && (
                <HandoverForm tasks={tasks} onComplete={() => {
                  refreshData();
                  setCurrentView('logs');
                }} />
              )}
              {currentView === 'logs' && (
                <HandoverLogs handovers={handovers} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
