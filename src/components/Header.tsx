import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Menu, MenuItem } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import AppsIcon from '@mui/icons-material/Apps';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from './NotificationBell';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: '#3f5568',
        boxShadow: 'none',
      }}
    >
      <Toolbar sx={{ minHeight: '56px !important', px: 2 }}>
        {/* Left side - Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: 'white',
              mr: 3,
              fontSize: '1.25rem',
            }}
          >
            keylcop
          </Typography>
          <Box
            sx={{
              height: '30px',
              width: '1px',
              bgcolor: 'rgba(255, 255, 255, 0.3)',
              mr: 3,
            }}
          />
          <Typography
            variant="body1"
            sx={{
              color: 'white',
              fontSize: '0.95rem',
            }}
          >
            Appointment Services Configuration
          </Typography>
        </Box>

        {/* Right side - Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit" size="medium">
            <SettingsIcon />
          </IconButton>

          <IconButton color="inherit" size="medium">
            <AppsIcon />
          </IconButton>

          <NotificationBell />

          <IconButton onClick={handleAvatarClick} sx={{ p: 0.5 }}>
            <Avatar
              sx={{
                bgcolor: '#7fb3d5',
                width: 36,
                height: 36,
                fontSize: '0.9rem',
                fontWeight: 'bold',
              }}
            >
              {user ? getInitials(user.name) : 'U'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {user?.email}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
