import { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Chip,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Notification, SSEMessage } from '../types';

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Create SSE connection
    const eventSource = api.createSSEConnection();
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data: SSEMessage = JSON.parse(event.data);

        if (data.type === 'notification' && data.data) {
          setNotifications((prev) => [data.data!, ...prev]);

          // Play notification sound (optional)
          // new Audio('/notification.mp3').play().catch(() => {});
        } else if (data.type === 'connected') {
          console.log('Connected to SSE:', data.message);
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, [isAuthenticated]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsOpened = async (id: string) => {
    try {
      await api.markNotificationAsOpened(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, opened: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as opened:', error);
    }
  };

  const handleClearAll = () => {
    setNotifications([]);
    handleClose();
  };

  const handleNotificationClick = async (notification: Notification) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
    handleClose();

    // Mark as opened (this also sends tracking callback to PM_INTERFACE)
    if (!notification.opened && !notification.read) {
      await handleMarkAsOpened(notification.id);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedNotification(null);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'release_notes':
        return 'info';
      default:
        return 'info';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 360, maxHeight: 480 },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {notifications.length > 0 && (
            <Typography
              variant="caption"
              color="primary"
              sx={{ cursor: 'pointer' }}
              onClick={handleClearAll}
            >
              Clear All
            </Typography>
          )}
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                bgcolor: notification.read ? 'transparent' : 'action.hover',
                whiteSpace: 'normal',
                py: 1.5,
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                    <Chip
                      label={notification.type}
                      size="small"
                      color={getTypeColor(notification.type)}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                    {notification.priority && (
                      <Chip
                        label={notification.priority}
                        size="small"
                        color={getPriorityColor(notification.priority)}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.primary" fontWeight="bold">
                      {notification.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {notification.content || notification.message}
                    </Typography>
                  </Box>
                }
              />
            </MenuItem>
          ))
        )}
      </Menu>

      {/* Notification Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        {selectedNotification && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="h6" component="span">
                  {selectedNotification.title}
                </Typography>
                <Chip
                  label={selectedNotification.type}
                  size="small"
                  color={getTypeColor(selectedNotification.type)}
                />
                {selectedNotification.priority && (
                  <Chip
                    label={selectedNotification.priority}
                    size="small"
                    color={getPriorityColor(selectedNotification.priority)}
                  />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {new Date(selectedNotification.timestamp).toLocaleString()}
                {selectedNotification.metadata?.sentBy &&
                  ` • Sent by: ${selectedNotification.metadata.sentBy}`}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ whiteSpace: 'pre-wrap' }}>
                <Typography variant="body1">
                  {selectedNotification.content || selectedNotification.message}
                </Typography>
              </Box>

              {selectedNotification.metadata && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Additional Information
                  </Typography>

                  {selectedNotification.metadata.applicationName && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Application:</strong> {selectedNotification.metadata.applicationName}
                    </Typography>
                  )}

                  {selectedNotification.metadata.jiraReleaseNotes && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>JIRA References:</strong> {selectedNotification.metadata.jiraReleaseNotes}
                    </Typography>
                  )}

                  {selectedNotification.metadata.groups && selectedNotification.metadata.groups.length > 0 && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Groups:</strong>{' '}
                      {selectedNotification.metadata.groups.map(g => g.name).join(', ')}
                    </Typography>
                  )}

                  {selectedNotification.source && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Source:</strong> {selectedNotification.source}
                    </Typography>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};
