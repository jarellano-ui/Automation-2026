/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'on-going' | 'completed';
  createdBy: string;
  assignedTo?: string[];
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  completedAt?: number;
  comments?: Comment[];
}

export interface Handover {
  id: string;
  fromShift: string;
  toShift: string;
  endorsedBy: string[];
  endorsedTo: string[];
  timestamp: number;
  taskIds: string[];
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'on-going' | 'completed';
  startedAt?: number;
  completedAt?: number;
  comments?: Comment[];
}

export type View = 'dashboard' | 'tasks' | 'handover' | 'logs' | 'schedule' | 'users' | 'feedback';

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  type: 'bug' | 'suggestion' | 'issue';
  title: string;
  message: string;
  timestamp: number;
  status: 'new' | 'investigating' | 'resolved';
}

export interface Notification {
  id: string;
  type: 'task' | 'handover';
  title: string;
  message: string;
  timestamp: number;
  readBy: string[]; // List of user IDs who opened the notification
  assignedToUserIds: string[]; // List of user IDs specifically mentioned/assigned
  linkView: View;
}
