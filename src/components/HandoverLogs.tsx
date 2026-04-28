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
      <div className="hc-card p-6 flex items-center justify-between">
        <h3 className="font-black flex items-center gap-3 text-xs uppercase tracking-wider text-gray-700">
          <History size={20} className="text-[#88C13E]" />
          Endorsement History
        </h3>
        <p className="text-[10px] text-[#4A773C] font-black bg-[#4A773C]/10 border border-[#4A773C]/20 px-4 py-1.5 rounded-full uppercase tracking-widest">
          Total Protocols: {handovers.length}
        </p>
      </div>

      <div className="space-y-4">
        {sortedHandovers.length > 0 ? (
          sortedHandovers.map((log) => (
            <div 
              key={log.id}
              className="hc-card overflow-hidden transition-all hover:bg-white hover:shadow-md hover:border-[#88C13E]/30 group"
            >
              <button 
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                className="w-full p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gray-50 group-hover:bg-[#4A773C]/10 border border-gray-100 group-hover:border-[#4A773C]/30 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-[#4A773C] transition-all">
                    <Clock size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-[10px] uppercase tracking-widest text-[#4A773C] py-1.5 px-3 bg-[#4A773C]/10 border border-[#4A773C]/20 rounded-lg">
                        {log.fromShift} → {log.toShift}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border shadow-sm ${
                        log.urgency === 'high' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                        log.urgency === 'medium' ? 'bg-amber-50 text-amber-500 border-amber-100' :
                        'bg-emerald-50 text-emerald-500 border-emerald-100'
                      }`}>
                        {log.urgency}
                      </span>
                      <span className="text-xs text-gray-400 font-bold">
                        {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="mt-2 text-left">
                      <h4 className="font-black text-gray-900 leading-tight">
                        {log.title || 'Untitled Endorsement'}
                      </h4>
                      <div className="flex flex-col gap-1 mt-2">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Endorsed By: {(log.endorsedBy || []).join(', ')}</p>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Endorsed To: {(log.endorsedTo || []).join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="hidden md:flex flex-col items-end">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Matrix Load</p>
                    <p className="font-black text-gray-600">{log.taskIds.length} Endorsed Items</p>
                  </div>
                  <div className={`p-2 rounded-full transition-all ${expandedId === log.id ? 'bg-[#4A773C] text-white shadow-lg shadow-[#4A773C]/20' : 'text-gray-300'}`}>
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
                    className="border-t border-gray-100 overflow-hidden"
                  >
                    <div className="p-10 space-y-10 bg-gray-50/50">
                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4A773C] mb-6 flex items-center gap-3">
                          <CheckCircle2 size={14} />
                          Endorsement Memo
                        </h5>
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 italic shadow-inner">
                          <p className="text-gray-600 leading-relaxed font-medium">
                            "{log.description || 'Terminal session closed with no additional broadcast notes.'}"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] pt-6 border-t border-gray-100">
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
          <div className="py-32 text-center text-gray-400">
            <History size={80} className="mx-auto mb-6 opacity-20" />
            <p className="font-black text-2xl tracking-tighter italic text-gray-600">Archive Empty</p>
            <p className="text-sm border-gray-100 border uppercase tracking-[0.2em] mt-3 py-2 px-6 rounded-full inline-block">No historical protocol data</p>
          </div>
        )}
      </div>
    </div>
  );
}
