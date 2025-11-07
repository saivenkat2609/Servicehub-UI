export interface User {
  userId: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
}

export interface Notification {
  id: string;
  notificationId: string;
  source?: string;
  title: string;
  content: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  type: 'info' | 'success' | 'warning' | 'error' | 'release_notes' | string;
  severity?: 'info' | 'warning' | 'error';
  message?: string; // For backward compatibility
  timestamp: string;
  read: boolean;
  opened: boolean;
  readAt?: string;
  openedAt?: string;
  metadata?: {
    sentBy?: string;
    sentAt?: string;
    jiraReleaseNotes?: string;
    groups?: Array<{ id: number; name: string }>;
    applicationId?: number;
    applicationName?: string;
    targetUser?: {
      userId?: number;
      name?: string;
      email?: string;
    };
  };
  trackingEnabled?: boolean;
  trackingCallbackUrl?: string;
}

export interface SSEMessage {
  type: 'connected' | 'notification' | 'ping';
  message?: string;
  data?: Notification;
  timestamp?: number;
}
