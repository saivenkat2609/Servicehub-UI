export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
  read: boolean;
}

export interface SSEMessage {
  type: 'connected' | 'notification' | 'ping';
  message?: string;
  data?: Notification;
  timestamp?: number;
}
