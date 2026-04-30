/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  position?: string;
}

const DEFAULT_USER: UserProfile = {
  name: '',
  role: '',
  email: '',
  position: ''
};

const STORAGE_KEY = 'hcit_user_profile';

export const auth = {
  getUser: (): UserProfile => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse user profile', e);
      }
    }
    return DEFAULT_USER;
  },

  setUser: (profile: UserProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  },

  getInitials: (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || '??';
  }
};
