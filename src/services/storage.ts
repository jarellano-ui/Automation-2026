/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, Handover } from '../types';

const TASKS_KEY = 'shiftbridge_tasks';
const HANDOVERS_KEY = 'shiftbridge_handovers';

const SEED_TASKS: Task[] = [
  {
    id: '1',
    title: 'Monitor Server Cluster #4',
    description: 'Reported high latency in APAC region. Needs continuous monitoring.',
    priority: 'high',
    status: 'pending',
    createdBy: 'Admin',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: '2',
    title: 'Update client documentation',
    description: 'Ensure all onboarding steps for the new shift are documented.',
    priority: 'medium',
    status: 'pending',
    createdBy: 'System',
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 7200000,
  }
];

export const storage = {
  getTasks: (): Task[] => {
    const data = localStorage.getItem(TASKS_KEY);
    if (!data) {
      storage.saveTasks(SEED_TASKS);
      return SEED_TASKS;
    }
    return JSON.parse(data);
  },

  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },

  getHandovers: (): Handover[] => {
    const data = localStorage.getItem(HANDOVERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveHandovers: (handovers: Handover[]) => {
    localStorage.setItem(HANDOVERS_KEY, JSON.stringify(handovers));
  }
};
