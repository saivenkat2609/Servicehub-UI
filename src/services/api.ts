import axios from 'axios';
import type { AuthResponse, User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6000/api';

// Create axios instance with credentials enabled for cookies
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for sending cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async logout(): Promise<void> {
    await axiosInstance.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await axiosInstance.get<User>('/auth/me');
    return response.data;
  },

  // Notification endpoints
  async getUserNotifications() {
    const response = await axiosInstance.get('/notifications');
    return response.data;
  },

  async markNotificationAsOpened(notificationId: string) {
    const response = await axiosInstance.post('/notifications/mark-opened', {
      notificationId,
    });
    return response.data;
  },

  // SSE connection
  createSSEConnection(): EventSource {
    // For SSE with cookies, we need to use the full URL
    // Cookies are automatically included by the browser
    return new EventSource(`${API_URL}/events`, {
      withCredentials: true,
    });
  },

  // Debug endpoints
  async getConnectedUsers() {
    const response = await axiosInstance.get('/debug/connected-users');
    return response.data;
  },

  async getStoredNotifications() {
    const response = await axiosInstance.get('/debug/stored-notifications');
    return response.data;
  },
};
