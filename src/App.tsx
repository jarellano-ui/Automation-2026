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
  ChevronRight,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { View, Task, Handover } from './types';
import { storage } from './services/storage';

// Views
import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import EndorsementBoard from './components/EndorsementBoard';
import HandoverLogs from './components/HandoverLogs';
import ITSchedule from './components/ITSchedule';

import { auth as authService, UserProfile } from './services/auth';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<UserProfile>(authService.getUser());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserProfile>(user);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    const [t, h] = await Promise.all([
      storage.getTasks(),
      storage.getHandovers()
    ]);
    setTasks(t);
    setHandovers(h);
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    authService.setUser(editUser);
    setUser(editUser);
    setIsProfileModalOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList },
    { id: 'handover', label: 'Next Shift Endorsement', icon: ArrowRightLeft },
    { id: 'schedule', label: 'IT Schedule', icon: Calendar },
    { id: 'logs', label: 'Activity Logs', icon: History },
  ];

  return (
    <div className="flex h-screen bg-[#F9FAF8] font-sans text-gray-900 overflow-hidden relative">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-gray-100 flex flex-col z-50 shrink-0 m-4 rounded-[2rem] shadow-sm"
      >
        <div className="p-6 flex items-center justify-between overflow-hidden">
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col gap-0.5"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#88C13E] rounded-full flex items-center justify-center shrink-0">
                  <div className="w-3 h-3 border-2 border-white rounded-full"></div>
                </div>
                <span className="font-black text-xs uppercase tracking-[0.1em] text-gray-400">HelloConnect</span>
              </div>
              <h1 className="font-extrabold text-sm tracking-tight text-[#4A773C] leading-none mt-1">
                HCIT ENDORSEMENT MATRIX
              </h1>
            </motion.div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors ml-auto text-gray-400 hover:text-[#4A773C]"
          >
            {isSidebarOpen ? <Menu size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${
                currentView === item.id 
                  ? 'bg-[#4A773C]/5 text-[#4A773C] font-bold border border-[#4A773C]/10' 
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
              }`}
            >
              <item.icon size={20} className={currentView === item.id ? 'text-[#88C13E]' : ''} />
              {isSidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {item.label}
                </motion.span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => {
              setEditUser(user);
              setIsProfileModalOpen(true);
            }}
            className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl transition-all ${isSidebarOpen ? '' : 'justify-center'}`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4A773C] to-[#88C13E] border-2 border-white shadow-sm shrink-0 flex items-center justify-center text-white font-black text-xs">
              {authService.getInitials(user.name)}
            </div>
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden text-left">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="font-bold text-sm truncate text-gray-900">{user.name}</p>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Synced with server" />
                </div>
                <p className="text-[10px] uppercase font-black tracking-widest text-[#88C13E]">{user.role}</p>
              </motion.div>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10 m-4">
        {/* Header */}
        <header className="h-20 bg-white border border-gray-100 rounded-[2rem] px-8 flex items-center justify-between shrink-0 mb-4 shadow-sm">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#4A773C] font-black mb-0.5">Official Endorsement Matrix</p>
            <h2 className="text-xl font-black italic tracking-tight text-gray-900 leading-none">
              {navItems.find(n => n.id === currentView)?.label}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4A773C] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="pl-12 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#88C13E] outline-none w-72 transition-all shadow-inner"
              />
            </div>
            
            <button className="relative p-2.5 text-gray-400 hover:text-[#4A773C] hover:bg-gray-50 rounded-xl transition-all">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-[#88C13E] rounded-full border-2 border-white shadow-sm" />
            </button>
            
            <button className="p-2.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
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
                <Dashboard tasks={tasks} handovers={handovers} onNavigate={setCurrentView} onUpdate={refreshData} />
              )}
              {currentView === 'tasks' && (
                <TaskBoard tasks={tasks} onUpdate={refreshData} />
              )}
              {currentView === 'handover' && (
                <EndorsementBoard 
                  handovers={handovers} 
                  tasks={tasks} 
                  onUpdate={refreshData} 
                />
              )}
              {currentView === 'schedule' && (
                <ITSchedule />
              )}
              {currentView === 'logs' && (
                <HandoverLogs handovers={handovers} tasks={tasks} onUpdate={refreshData} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="hc-card w-full max-w-md p-8 relative z-10 border-t-4 border-t-[#88C13E]"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4A773C]">User Profile</p>
                  <h3 className="text-2xl font-black italic tracking-tight text-gray-900">Identity Config</h3>
                </div>
                <button onClick={() => setIsProfileModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={saveProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Full Name</label>
                  <input 
                    type="text"
                    value={editUser.name}
                    onChange={e => setEditUser({...editUser, name: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#88C13E] transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Designation / Role</label>
                  <input 
                    type="text"
                    value={editUser.role}
                    onChange={e => setEditUser({...editUser, role: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#88C13E] transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Enterprise Email</label>
                  <input 
                    type="email"
                    value={editUser.email}
                    onChange={e => setEditUser({...editUser, email: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#88C13E] transition-all font-bold"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-[#4A773C] text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#88C13E] transition-all shadow-xl shadow-[#4A773C]/20"
                  >
                    Commit Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
