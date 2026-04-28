/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
}

export type View = 'dashboard' | 'tasks' | 'handover' | 'logs' | 'schedule';
