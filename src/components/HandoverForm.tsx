/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  User,
  Clock,
  Send
} from 'lucide-react';
import { Task, Handover } from '../types';
import { storage } from '../services/storage';
import { motion, AnimatePresence } from 'motion/react';

interface HandoverFormProps {
  tasks: Task[];
  onComplete: () => void;
}

export default function HandoverForm({ tasks, onComplete }: HandoverFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fromShift: 'Day',
    toShift: 'Night',
    endorsedBy: 'John Arellano',
    notes: '',
    systemStatus: [
      { name: 'Core Infrastructure', status: 'up' as const },
      { name: 'Database Clusters', status: 'up' as const },
      { name: 'API Services', status: 'up' as const },
      { name: 'Customer Portal', status: 'up' as const },
    ]
  });

  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  const handleSubmit = () => {
    const newHandover: Handover = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      taskIds: pendingTasks.map(t => t.id),
      ...formData
    };

    const currentHandovers = storage.getHandovers();
    storage.saveHandovers([...currentHandovers, newHandover]);
    onComplete();
  };

  const updateSystemStatus = (idx: number, status: 'up' | 'down' | 'degraded') => {
    const next = [...formData.systemStatus];
    next[idx].status = status;
    setFormData({ ...formData, systemStatus: next });
  };

  const steps = [
    { id: 1, title: 'Identity', icon: User },
    { id: 2, title: 'Systems', icon: Activity },
    { id: 3, title: 'Payload', icon: CheckCircle2 },
    { id: 4, title: 'Confirm', icon: Send },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-16 relative px-8">
        <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-px bg-white/10 -z-0" />
        {steps.map((s) => (
          <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              step >= s.id 
                ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' 
                : 'glass text-slate-500'
            }`}>
              {step > s.id ? <CheckCircle2 size={24} /> : <s.icon size={24} />}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] pointer-events-none transition-colors duration-500 ${
              step >= s.id ? 'text-indigo-400' : 'text-slate-600'
            }`}>
              {s.title}
            </span>
          </div>
        ))}
      </div>

      <div className="glass rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/20">
        <div className="p-12">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="space-y-10"
              >
                <div className="space-y-3">
                  <h3 className="text-3xl font-black tracking-tight italic">Terminal Session</h3>
                  <p className="text-slate-500 font-medium">Define the shift vector for this endorsement.</p>
                </div>

                <div className="grid grid-cols-2 gap-8 text-slate-100">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">Origin Shift</label>
                    <select 
                      value={formData.fromShift}
                      onChange={e => setFormData({...formData, fromShift: e.target.value})}
                      className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all text-slate-100"
                    >
                      <option className="bg-slate-900">Day</option>
                      <option className="bg-slate-900">Night</option>
                      <option className="bg-slate-900">Graveyard</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">Destination Shift</label>
                    <select 
                      value={formData.toShift}
                      onChange={e => setFormData({...formData, toShift: e.target.value})}
                      className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all text-slate-100"
                    >
                      <option className="bg-slate-900">Day</option>
                      <option className="bg-slate-900">Night</option>
                      <option className="bg-slate-900">Graveyard</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">Officer in Charge</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
                    <input 
                      type="text"
                      value={formData.endorsedBy}
                      onChange={e => setFormData({...formData, endorsedBy: e.target.value})}
                      className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all text-slate-100"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="space-y-10"
              >
                <div className="space-y-3">
                  <h3 className="text-3xl font-black tracking-tight italic text-emerald-400">System Integrity</h3>
                  <p className="text-slate-500 font-medium">Verify health for all critical infrastructure.</p>
                </div>

                <div className="space-y-4">
                  {formData.systemStatus.map((sys, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                      <span className="font-bold text-slate-200 tracking-tight">{sys.name}</span>
                      <div className="flex gap-2 p-1 glass rounded-xl">
                        {(['up', 'degraded', 'down'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => updateSystemStatus(idx, s)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                              sys.status === s 
                                ? s === 'up' ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/20' :
                                  s === 'degraded' ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/20' :
                                  'bg-rose-500 text-white border-rose-600 shadow-lg shadow-rose-500/20'
                                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-400'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="space-y-10"
              >
                <div className="space-y-3">
                  <h3 className="text-3xl font-black tracking-tight italic">Handover Pack</h3>
                  <p className="text-slate-500 font-medium">The following {pendingTasks.length} requirements will bridge the gap.</p>
                </div>

                <div className="max-h-[340px] overflow-y-auto pr-3 space-y-4 custom-scrollbar">
                  {pendingTasks.map((t) => (
                    <div key={t.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-4">
                         <div className={`w-1.5 h-8 rounded-full ${
                           t.priority === 'high' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 
                           t.priority === 'medium' ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 
                           'bg-emerald-500'
                         }`}></div>
                        <div>
                          <p className="font-bold text-slate-100">{t.title}</p>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t.priority} PRIORITY REQUIREMENT</p>
                        </div>
                      </div>
                      <CheckCircle2 className="text-indigo-500" size={24} />
                    </div>
                  ))}
                  {pendingTasks.length === 0 && (
                    <div className="py-20 text-center text-slate-700 flex flex-col items-center gap-4">
                      <CheckCircle2 size={64} className="opacity-5" />
                      <p className="text-lg font-black italic tracking-tight">Zero Bridges Required</p>
                      <p className="text-xs uppercase tracking-widest opacity-60">All sectors are fully optimized</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="space-y-10"
              >
                <div className="space-y-3">
                  <h3 className="text-3xl font-black tracking-tight italic">Protocol Endorsement</h3>
                  <p className="text-slate-500 font-medium">Encrypt final instructions into the handover memo.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] font-sans">Handover Memo</label>
                  <textarea 
                    autoFocus
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    placeholder="Provide final shift context or anomalous behavior logs..."
                    className="w-full p-8 bg-white/5 border border-white/10 rounded-[2rem] outline-none focus:ring-2 focus:ring-indigo-500 font-bold min-h-[200px] text-lg text-slate-100 transition-all shadow-inner placeholder:text-slate-700"
                  />
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-3xl flex gap-5 items-start">
                  <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                    <AlertCircle size={24} />
                  </div>
                  <p className="text-sm font-medium text-slate-400 leading-relaxed pt-1">
                    By finalizing, you confirm the matrix state is accurate. This protocol will be timestamped and logged permanently for incoming personnel.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-12 py-10 bg-black/20 border-t border-white/5 flex items-center justify-between">
          <button
            disabled={step === 1}
            onClick={() => setStep(s => s - 1)}
            className={`flex items-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] transition-all ${
              step === 1 ? 'opacity-0' : 'text-slate-500 hover:text-white'
            }`}
          >
            <ChevronLeft size={20} />
            Reverse Step
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
            >
              Advance Step
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 group"
            >
              FINALIZE HANDOVER
              <ArrowRightLeft size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
