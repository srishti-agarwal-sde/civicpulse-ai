import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Badge as MuiBadge,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  Notifications,
  AccountCircle,
  Dashboard as DashboardIcon,
  Leaderboard as LeaderboardIcon,
  Map as MapIcon,
  AdminPanelSettings,
  Logout,
  Star,
  Campaign,
  FiberManualRecord,
} from '@mui/icons-material';

const Navbar = () => {
  const { user, logout, notifications, unreadNotificationsCount, markNotificationAsRead } = useAuth();
  const { darkMode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleOpenNotificationsMenu = (event) => setAnchorElNotifications(event.currentTarget);
  const handleCloseNotificationsMenu = () => setAnchorElNotifications(null);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif._id);
    }
    handleCloseNotificationsMenu();
    if (notif.relatedIssue) {
      navigate(`/issues/${notif.relatedIssue}`);
    } else {
      navigate('/profile');
    }
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/');
  };

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 3 } }}>
        {/* Brand Logo */}
        <Box display="flex" alignItems="center" component={Link} to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Campaign color="primary" sx={{ mr: 1, fontSize: 32 }} />
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 800,
              letterSpacing: '.05rem',
              background: 'linear-gradient(45deg, #00e5ff 30%, #ff6d00 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CivicPulse AI
          </Typography>
        </Box>

        {/* Action Items */}
        <Box display="flex" alignItems="center" gap={1}>
          {/* Public Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 2 }}>
            <Button component={Link} to="/dashboard" color="inherit" startIcon={<DashboardIcon />}>
              Dashboard
            </Button>
            <Button component={Link} to="/map" color="inherit" startIcon={<MapIcon />}>
              Map
            </Button>
            <Button component={Link} to="/leaderboard" color="inherit" startIcon={<LeaderboardIcon />}>
              Leaderboard
            </Button>
          </Box>

          {/* Light/Dark Toggle */}
          <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton onClick={toggleTheme} color="inherit">
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          {user ? (
            <>
              {/* Reputation Indicator (SaaS Metric Widget) */}
              <Box
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(0, 229, 255, 0.3)',
                  borderRadius: 3,
                  py: 0.5,
                  px: 1.5,
                  gap: 1,
                  mr: 1,
                }}
              >
                <Star sx={{ color: '#ffea00', fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {user.reputationScore} Rep
                </Typography>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: 'rgba(255,255,255,0.1)' }} />
                <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>
                  {user.points} pts
                </Typography>
              </Box>

              {/* Notifications Menu Trigger */}
              <IconButton onClick={handleOpenNotificationsMenu} color="inherit">
                <MuiBadge badgeContent={unreadNotificationsCount} color="error">
                  <Notifications />
                </MuiBadge>
              </IconButton>

              <Menu
                anchorEl={anchorElNotifications}
                open={Boolean(anchorElNotifications)}
                onClose={handleCloseNotificationsMenu}
                slotProps={{
                  paper: {
                    sx: { width: 320, maxHeight: 400, borderRadius: 3, mt: 1 },
                  },
                }}
              >
                <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Notifications
                  </Typography>
                  {unreadNotificationsCount > 0 && (
                    <Typography variant="caption" color="primary" fontWeight={600}>
                      {unreadNotificationsCount} unread
                    </Typography>
                  )}
                </Box>
                <Divider />
                {notifications.length === 0 ? (
                  <MenuItem sx={{ py: 3, justifyContent: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      No notifications yet
                    </Typography>
                  </MenuItem>
                ) : (
                  <List sx={{ py: 0 }}>
                    {notifications.map((notif) => (
                      <ListItem
                        key={notif._id}
                        onClick={() => handleNotificationClick(notif)}
                        sx={{
                          cursor: 'pointer',
                          backgroundColor: notif.isRead ? 'transparent' : 'action.hover',
                          '&:hover': { backgroundColor: 'action.selected' },
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        {!notif.isRead && (
                          <ListItemIcon sx={{ minWidth: 20 }}>
                            <FiberManualRecord color="primary" sx={{ fontSize: 10 }} />
                          </ListItemIcon>
                        )}
                        <ListItemText
                          primary={notif.title}
                          secondary={notif.message}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: notif.isRead ? 500 : 700,
                            color: 'text.primary',
                          }}
                          secondaryTypographyProps={{ variant: 'caption', noWrap: false }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Menu>

              {/* User Menu Profile Avatar */}
              <Tooltip title="Account settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34 }}>
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                slotProps={{
                  paper: {
                    sx: { width: 220, borderRadius: 3, mt: 1 },
                  },
                }}
              >
                <Box px={2} py={1.5}>
                  <Typography variant="body1" fontWeight={700}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/dashboard'); }}>
                  <DashboardIcon sx={{ mr: 1.5, fontSize: 20 }} /> Dashboard
                </MenuItem>
                <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
                  <AccountCircle sx={{ mr: 1.5, fontSize: 20 }} /> Profile
                </MenuItem>
                {user.role === 'admin' && (
                  <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/admin'); }}>
                    <AdminPanelSettings sx={{ mr: 1.5, fontSize: 20 }} /> Admin Panel
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <Logout sx={{ mr: 1.5, fontSize: 20 }} /> Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box display="flex" gap={1}>
              <Button component={Link} to="/login" variant="outlined" size="small" color="primary">
                Login
              </Button>
              <Button component={Link} to="/register" variant="contained" size="small" color="primary">
                Register
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
