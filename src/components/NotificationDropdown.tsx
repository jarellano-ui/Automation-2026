/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  ClipboardList, 
  ArrowRightLeft, 
  User, 
  CircleDot
} from 'lucide-react';
import { Notification, View } from '../types';

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (view: View) => void;
  onClose: () => void;
  currentUserId?: string;
  currentUserName?: string;
}

export default function NotificationDropdown({ 
  notifications, 
  onMarkRead, 
  onMarkAllRead, 
  onNavigate,
  onClose,
  currentUserId,
  currentUserName
}: NotificationDropdownProps) {
  const unreadCount = notifications.filter(n => !(n.readBy || []).includes(currentUserId || '')).length;

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-[100] overflow-hidden flex flex-col max-h-[500px]">
      <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black italic tracking-tight text-gray-900">Notifications</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#4A773C]">
            {unreadCount} New Alerts
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={onMarkAllRead}
            className="text-[9px] font-black uppercase tracking-widest text-[#88C13E] hover:text-[#4A773C] transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => {
              const isUnread = !(n.readBy || []).includes(currentUserId || '');
              const isAssignedToMe = currentUserName && (n.assignedToUserIds || []).includes(currentUserName);
              
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    onMarkRead(n.id);
                    onNavigate(n.linkView);
                    onClose();
                  }}
                  className={`w-full p-4 flex gap-4 text-left transition-all hover:bg-gray-50 group relative ${isUnread ? 'bg-white' : 'opacity-60 bg-gray-50/20'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    n.type === 'task' ? 'bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white' : 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white'
                  }`}>
                    {n.type === 'task' ? <ClipboardList size={18} /> : <ArrowRightLeft size={18} />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${n.type === 'task' ? 'text-blue-500' : 'text-emerald-500'}`}>
                        {n.type}
                      </span>
                      <span className="text-[9px] font-medium text-gray-400 flex items-center gap-1 shrink-0">
                        <Clock size={10} />
                        {formatTime(n.timestamp)}
                      </span>
                    </div>
                    
                    <h4 className="text-xs font-bold text-gray-900 truncate mb-0.5">
                      {n.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                       {isAssignedToMe && (
                         <div className="flex items-center gap-1 px-2 py-0.5 bg-[#4A773C] text-white rounded-full">
                           <User size={8} />
                           <span className="text-[7px] font-black uppercase tracking-tighter">Directly Assigned To You</span>
                         </div>
                       )}
                       {isUnread && (
                         <div className="w-1.5 h-1.5 rounded-full bg-[#88C13E]" />
                       )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
               <Bell size={24} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">All caught up</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50/50 border-t border-gray-50 text-center">
        <button 
          onClick={onClose}
          className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
        >
          Close Panel
        </button>
      </div>
    </div>
  );
}
