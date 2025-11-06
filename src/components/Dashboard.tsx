import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Header } from './Header';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Dashboard = () => {
  const { token, user } = useAuth();
  const [targetEmail, setTargetEmail] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);

  useEffect(() => {
    loadConnectedUsers();
  }, []);

  const loadConnectedUsers = async () => {
    if (!token) return;
    try {
      const response = await api.getConnectedUsers(token);
      setConnectedUsers(response.connectedUsers);
    } catch (err) {
      console.error('Failed to load connected users:', err);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!token) throw new Error('Not authenticated');

      await api.sendNotification(token, targetEmail, message, type);
      setSuccess('Notification sent successfully!');
      setMessage('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Header />

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Welcome, {user?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You are now connected to the notification system. You can send notifications to other users below.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Connected Users ({connectedUsers.length}):
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {connectedUsers.length === 0 ? (
                  <Chip label="No users connected" size="small" />
                ) : (
                  connectedUsers.map((email) => (
                    <Chip
                      key={email}
                      label={email}
                      size="small"
                      color={email === user?.email ? 'primary' : 'default'}
                      onClick={() => setTargetEmail(email)}
                    />
                  ))
                )}
              </Box>
              <Button
                size="small"
                onClick={loadConnectedUsers}
                sx={{ mt: 1 }}
              >
                Refresh
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Send Notification
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Send a real-time notification to a specific user via SSE
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSendNotification}>
            <TextField
              fullWidth
              label="Target User Email"
              type="email"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              margin="normal"
              required
              helperText="Enter the email of the user who should receive this notification"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Notification Type</InputLabel>
              <Select
                value={type}
                label="Notification Type"
                onChange={(e) => setType(e.target.value)}
              >
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              margin="normal"
              required
              helperText="Enter the notification message"
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              startIcon={<SendIcon />}
              sx={{ mt: 2 }}
            >
              {loading ? 'Sending...' : 'Send Notification'}
            </Button>
          </form>
        </Paper>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" fontWeight="bold">
            💡 Demo Instructions:
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            1. Open another browser/incognito window and register a different user
            <br />
            2. Click on the connected user chips above to auto-fill their email
            <br />
            3. Send a notification and watch it appear in real-time in their notification bell!
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
