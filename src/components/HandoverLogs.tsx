/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  History, 
  Calendar, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Handover } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface HandoverLogsProps {
  handovers: Handover[];
}

export default function HandoverLogs({ handovers }: HandoverLogsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedHandovers = [...handovers].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-6 pb-8">
      <div className="glass p-6 rounded-3xl flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-3 text-sm uppercase tracking-wider text-slate-300">
          <History size={20} className="text-indigo-400" />
          Endorsement History
        </h3>
        <p className="text-[10px] text-indigo-300 font-black bg-indigo-500/20 border border-indigo-500/30 px-4 py-1.5 rounded-full uppercase tracking-widest">
          Total Protocols: {handovers.length}
        </p>
      </div>

      <div className="space-y-4">
        {sortedHandovers.length > 0 ? (
          sortedHandovers.map((log) => (
            <div 
              key={log.id}
              className="glass rounded-3xl overflow-hidden transition-all hover:bg-white/10 group"
            >
              <button 
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                className="w-full p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white/5 group-hover:bg-indigo-500/20 border border-white/10 group-hover:border-indigo-500/30 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-all">
                    <Clock size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-[10px] uppercase tracking-widest text-indigo-400 py-1.5 px-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                        {log.fromShift} → {log.toShift}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">
                        {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="font-black text-lg mt-1 tracking-tight">Endorsed by {log.endorsedBy}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="hidden md:flex flex-col items-end">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Matrix Load</p>
                    <p className="font-black text-slate-400">{log.taskIds.length} Endorsed Items</p>
                  </div>
                  <div className={`p-2 rounded-full transition-all ${expandedId === log.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-600'}`}>
                    {expandedId === log.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {expandedId === log.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5 overflow-hidden"
                  >
                    <div className="p-10 space-y-10 bg-black/10">
                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/60 mb-6 flex items-center gap-3">
                          <Activity size={14} />
                          System Health Snapshot
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {log.systemStatus.map((sys, idx) => (
                            <div key={idx} className="bg-white/5 p-5 rounded-2xl border border-white/5 flex flex-col gap-2">
                              <span className="text-xs font-bold text-slate-300 truncate">{sys.name}</span>
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  sys.status === 'up' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                                  sys.status === 'degraded' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 
                                  'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                                }`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${
                                  sys.status === 'up' ? 'text-emerald-400' : 
                                  sys.status === 'degraded' ? 'text-amber-400' : 
                                  'text-rose-400'
                                }`}>
                                  {sys.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/60 mb-6 flex items-center gap-3">
                          <CheckCircle2 size={14} />
                          Endorsement Memo
                        </h5>
                        <div className="bg-white/5 p-8 rounded-3xl border border-white/5 shadow-inner">
                          <p className="text-slate-300 leading-relaxed italic font-medium">
                            "{log.notes || 'Terminal session closed with no additional broadcast notes.'}"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] pt-6 border-t border-white/5">
                        <span>Terminal ID: {log.id}</span>
                        <span>Shift Closed: {new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        ) : (
          <div className="py-32 text-center text-slate-800">
            <History size={80} className="mx-auto mb-6 opacity-5" />
            <p className="font-black text-2xl tracking-tighter italic">Archive Empty</p>
            <p className="text-sm border uppercase tracking-[0.2em] mt-3">No historical endorsement data found</p>
          </div>
        )}
      </div>
    </div>
  );
}
