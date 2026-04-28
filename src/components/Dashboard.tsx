/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ArrowRightLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Activity,
  Plus
} from 'lucide-react';
import { Task, Handover, View } from '../types';

interface DashboardProps {
  tasks: Task[];
  handovers: Handover[];
  onNavigate: (view: View) => void;
}

export default function Dashboard({ tasks, handovers, onNavigate }: DashboardProps) {
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const urgentTasks = pendingTasks.filter(t => t.priority === 'high');
  const lastHandover = handovers[handovers.length - 1];

  const stats = [
    { label: 'Active Tasks', value: pendingTasks.length, icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Urgent Action', value: urgentTasks.length, icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Completed Today', value: tasks.filter(t => t.status === 'completed').length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass rounded-3xl p-6 flex items-center gap-4 transition-transform hover:scale-[1.02]">
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <section className="glass rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-slate-300">
                <Activity size={18} className="text-indigo-400" />
                Latest Shift Activity
              </h3>
              <button 
                onClick={() => onNavigate('logs')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest transition-colors"
              >
                Full History
              </button>
            </div>
            <div className="p-0">
              {lastHandover ? (
                <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-indigo-400 text-lg">
                        {lastHandover.endorsedBy[0]}
                      </div>
                      <div>
                        <p className="font-bold text-lg leading-tight">{lastHandover.endorsedBy} endorsed shift</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          {new Date(lastHandover.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      {lastHandover.fromShift} → {lastHandover.toShift}
                    </span>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-5 text-slate-300 italic border-l-4 border-indigo-500 text-sm leading-relaxed">
                    "{lastHandover.notes}"
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {lastHandover.systemStatus.map((sys, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className={`w-2 h-2 rounded-full ${
                          sys.status === 'up' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                          sys.status === 'degraded' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 
                          'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                        }`} />
                        <span className="text-xs font-bold text-slate-300">{sys.name}</span>
                        <span className="text-[10px] font-black uppercase text-slate-500 ml-auto">{sys.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-20 text-center text-slate-500">
                  <ArrowRightLeft size={64} className="mx-auto mb-4 opacity-10" />
                  <p className="font-bold text-lg">No Handover Protocol Initiated</p>
                  <p className="text-sm opacity-60">System stands by for first shift endorsement.</p>
                </div>
              )}
            </div>
          </section>

          <section className="glass rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-slate-300">
                <TrendingUp size={18} className="text-emerald-400" />
                Resource Analytics
              </h3>
            </div>
            <div className="p-10 h-64 flex items-end justify-around gap-6">
              {['low', 'medium', 'high'].map((p) => {
                const count = tasks.filter(t => t.priority === p && t.status !== 'completed').length;
                const max = Math.max(...['low', 'medium', 'high'].map(p2 => tasks.filter(t => t.priority === p2 && t.status !== 'completed').length), 1);
                const height = (count / max) * 100;
                return (
                  <div key={p} className="flex-1 flex flex-col items-center gap-4">
                    <div className="w-full relative bg-white/5 rounded-2xl h-48 overflow-hidden group">
                      <div 
                        className={`absolute bottom-0 w-full transition-all duration-1000 ease-out group-hover:brightness-110 ${
                          p === 'high' ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 
                          p === 'medium' ? 'bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 
                          'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        }`}
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute top-3 w-full text-center text-white font-black text-xs">
                          {count}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{p} priority</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-2xl shadow-indigo-500/20 relative overflow-hidden group transition-all hover:-translate-y-1">
            <div className="relative z-10 flex flex-col h-full">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-2">Protocol Ready</p>
              <h4 className="text-2xl font-black mb-4 leading-tight italic">Transition Phase?</h4>
              <p className="text-indigo-100 text-sm mb-10 opacity-80 leading-relaxed font-medium">Verify your output and endorse the terminal state for the incoming shift.</p>
              <button 
                onClick={() => onNavigate('handover')}
                className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-xl group-hover:gap-5"
              >
                START HANDOVER
                <ArrowRightLeft size={20} />
              </button>
            </div>
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
            <ArrowRightLeft size={160} className="absolute -bottom-16 -right-16 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
          </div>

          <div className="glass p-6 rounded-3xl">
            <h4 className="font-bold mb-5 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-300">
              <Plus size={18} className="text-indigo-400" />
              Direct Entry
            </h4>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Log urgent requirement..."
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-slate-200 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
              />
              <button 
                onClick={() => onNavigate('tasks')}
                className="w-full text-[10px] text-slate-500 hover:text-indigo-400 font-black uppercase tracking-widest transition-colors text-center"
              >
                Access Full Task Matrix →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
