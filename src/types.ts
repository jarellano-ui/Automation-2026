/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  createdBy: string;
  assignedTo?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Handover {
  id: string;
  fromShift: string;
  toShift: string;
  endorsedBy: string;
  receivedBy?: string;
  timestamp: number;
  taskIds: string[];
  notes: string;
  systemStatus: {
    name: string;
    status: 'up' | 'down' | 'degraded';
  }[];
}

export type View = 'dashboard' | 'tasks' | 'handover' | 'logs';
