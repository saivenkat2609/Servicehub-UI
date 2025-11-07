import type { AuthResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  async register(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  async sendNotification(token: string, targetEmail: string, message: string, type: string = 'info') {
    const response = await fetch(`${API_URL}/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ targetEmail, message, type }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send notification');
    }

    return response.json();
  },

  async sendBulkNotifications(
    token: string,
    notifications: Array<{ targetEmail: string; message: string; type?: string }>
  ) {
    const response = await fetch(`${API_URL}/notifications/send-bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ notifications }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send bulk notifications');
    }

    return response.json();
  },

  async getConnectedUsers(token: string) {
    const response = await fetch(`${API_URL}/notifications/connected-users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get connected users');
    }

    return response.json();
  },

  async getUserNotifications(token: string) {
    const response = await fetch(`${API_URL}/notifications/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user notifications');
    }

    return response.json();
  },

  async markNotificationAsRead(token: string, notificationId: string) {
    const response = await fetch(`${API_URL}/notifications/mark-read/${notificationId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to mark notification as read');
    }

    return response.json();
  },

  async trackNotificationOpen(notificationId: string, userId: number | undefined, email: string) {
    const response = await fetch(`${API_URL}/notifications/track-open`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId,
        userId,
        email,
        openedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to track notification open');
    }

    return response.json();
  },

  createSSEConnection(token: string): EventSource {
    return new EventSource(`${API_URL}/sse?token=${token}`);
  },
};
