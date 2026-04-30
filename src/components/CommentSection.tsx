/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, MessageSquare, History, Trash2 } from 'lucide-react';
import { Comment } from '../types';
import { auth as authService } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
  onDeleteComment?: (commentId: string) => void;
  title?: string;
}

export default function CommentSection({ 
  comments = [], 
  onAddComment, 
  onDeleteComment,
  title = "Comments" 
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const { user: sessionUser } = useAuth();
  const localUser = authService.getUser();
  const currentUserName = sessionUser?.name || localUser.name;
  const isAdmin = sessionUser?.role === 'ADMIN';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(newComment.trim());
    setNewComment('');
  };

  const sortedComments = [...comments].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare size={16} className="text-[#4A773C]" />
        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4A773C]">
          {title} ({comments.length})
        </h5>
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a note or update..."
          className="w-full bg-white border border-gray-100 rounded-xl px-5 py-3.5 pr-14 text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#88C13E] transition-all shadow-inner placeholder:text-gray-300"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#4A773C] text-white rounded-lg hover:bg-[#88C13E] transition-all disabled:opacity-30 disabled:grayscale"
        >
          <Send size={16} />
        </button>
      </form>

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {sortedComments.length > 0 ? (
            sortedComments.map((comment) => (
              <motion.div
                layout
                key={comment.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/50 border border-gray-100 rounded-2xl p-4 flex flex-col gap-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-black text-gray-400">
                      {authService.getInitials(comment.author)}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-900">
                      {comment.author}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-gray-400">
                      <History size={10} />
                      {new Date(comment.timestamp).toLocaleDateString()} {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {onDeleteComment && (comment.author === currentUserName || isAdmin) && (
                      <button 
                        onClick={() => onDeleteComment(comment.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  {comment.text}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">
                No activity recorded yet
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
