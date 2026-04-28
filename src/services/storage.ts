/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, Handover } from '../types';

export const storage = {
  getTasks: async (): Promise<Task[]> => {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return await response.json();
    } catch (e) {
      console.error('Error fetching tasks', e);
      return [];
    }
  },

  saveTasks: async (tasks: Task[]): Promise<void> => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tasks),
      });
    } catch (e) {
      console.error('Error saving tasks', e);
    }
  },

  getHandovers: async (): Promise<Handover[]> => {
    try {
      const response = await fetch('/api/handovers');
      if (!response.ok) throw new Error('Failed to fetch handovers');
      const data: any[] = await response.json();
      return data.map(h => ({
        ...h,
        endorsedBy: Array.isArray(h.endorsedBy) ? h.endorsedBy : (h.endorsedBy ? [h.endorsedBy] : []),
        endorsedTo: Array.isArray(h.endorsedTo) ? h.endorsedTo : (h.endorsedTo ? [h.endorsedTo] : []),
        urgency: h.urgency || 'medium',
        status: h.status || 'pending',
        title: h.title || '',
        description: h.description || h.notes || ''
      }));
    } catch (e) {
      console.error('Error fetching handovers', e);
      return [];
    }
  },

  updateHandovers: async (handovers: Handover[]): Promise<void> => {
    try {
      await fetch('/api/handovers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(handovers),
      });
    } catch (e) {
      console.error('Error updating handovers', e);
    }
  },

  saveHandover: async (handover: Handover): Promise<void> => {
    try {
      await fetch('/api/handovers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(handover),
      });
    } catch (e) {
      console.error('Error saving handover', e);
    }
  }
};
