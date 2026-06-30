import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
} from '@mui/material';
import {
  Campaign,
  EmojiEvents,
  Shield,
  MilitaryTech,
  Star,
  CheckCircle,
  MailOutline,
  FactCheck,
} from '@mui/icons-material';

const getBadgeIcon = (iconName) => {
  const props = { sx: { fontSize: 32, color: '#ff6d00' } };
  switch (iconName) {
    case 'Campaign': return <Campaign {...props} />;
    case 'EmojiEvents': return <EmojiEvents {...props} />;
    case 'Shield': return <Shield {...props} />;
    case 'MilitaryTech': return <MilitaryTech {...props} />;
    case 'FactCheck': return <FactCheck {...props} />;
    default: return <CheckCircle {...props} />;
  }
};

const Profile = () => {
  const { user, notifications, markNotificationAsRead } = useAuth();

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>Loading user profile...</Typography>
      </Box>
    );
  }

  // Calculate next reputation level benchmark
  const nextLevelRep = 500;
  const currentLevelProgress = Math.min((user.reputationScore / nextLevelRep) * 100, 100);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={4}>
        {/* Left Column: Account Details & Badge Grid */}
        <Grid item xs={12} md={5}>
          {/* Profile Overview Card */}
          <Card sx={{ mb: 4, position: 'relative', overflow: 'visible' }}>
            <Box
              sx={{
                height: 100,
                background: 'linear-gradient(135deg, #00b0ff 0%, #00e5ff 100%)',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}
            />
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'secondary.main',
                fontSize: 32,
                border: '4px solid #151c2c',
                position: 'absolute',
                top: 60,
                left: 24,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>

            <CardContent sx={{ pt: 7, px: 3, pb: 3 }}>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {user.email}
              </Typography>
              <Chip
                label={user.role.toUpperCase()}
                color="primary"
                size="small"
                sx={{ mb: 3, fontWeight: 700 }}
              />

              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.06)' }} />

              {/* Game Stats */}
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" display="block">
                    REPUTATION SCORE
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="secondary.main">
                    {user.reputationScore}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" display="block">
                    TOTAL POINTS
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="primary.main">
                    {user.points}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" display="block">
                    REPORTS SUBMITTED
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {user.reportCount}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" display="block">
                    VALIDATIONS CAST
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {user.validationCount}
                  </Typography>
                </Grid>
              </Grid>

              {/* Progress to Next Level */}
              <Box sx={{ mt: 4 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="caption" color="textSecondary" fontWeight={700}>
                    PROGRESS TO LOCAL CHAMPION
                  </Typography>
                  <Typography variant="caption" color="secondary.main" fontWeight={700}>
                    {user.reputationScore}/{nextLevelRep} Rep
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={currentLevelProgress}
                  color="secondary"
                  sx={{ borderRadius: 2, height: 8 }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Earned Badges Showcase */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <EmojiEvents color="secondary" />
                <Typography variant="h6" fontWeight={700}>
                  Unlocked Achievements ({user.badges?.length || 0})
                </Typography>
              </Box>
              <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.06)' }} />

              {user.badges?.length === 0 ? (
                <Typography variant="body2" color="textSecondary" align="center" py={2}>
                  No badges unlocked yet. Start reporting and validating community issues to earn!
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {user.badges?.map((badge) => (
                    <Grid item xs={12} key={badge._id}>
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={2}
                        p={2}
                        borderRadius={3}
                        bgcolor="rgba(255,255,255,0.02)"
                        border="1px solid rgba(255,255,255,0.05)"
                      >
                        {getBadgeIcon(badge.icon)}
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {badge.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" display="block">
                            {badge.description}
                          </Typography>
                          <Typography variant="caption" color="primary.main" display="block" mt={0.5} fontWeight={600}>
                            Goal: {badge.criteria}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Achievements logs & Notification logs */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <MailOutline color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Notification Log History ({notifications.length})
                </Typography>
              </Box>
              <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.06)' }} />

              {notifications.length === 0 ? (
                <Typography variant="body2" color="textSecondary" align="center" py={4}>
                  No historical notifications found.
                </Typography>
              ) : (
                <List>
                  {notifications.map((notif) => (
                    <React.Fragment key={notif._id}>
                      <ListItem
                        alignItems="flex-start"
                        onClick={async () => {
                          if (!notif.isRead) {
                            await markNotificationAsRead(notif._id);
                          }
                        }}
                        sx={{
                          cursor: 'pointer',
                          px: 1,
                          borderRadius: 2,
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                          <Star sx={{ color: notif.isRead ? 'text.secondary' : 'secondary.main' }} />
                        </ListItemIcon>
                        <ListItemText
                          primaryTypographyProps={{ component: 'div' }}
                          secondaryTypographyProps={{ component: 'div' }}
                          primary={
                            <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={1}>
                              <Typography variant="body2" fontWeight={700} color={notif.isRead ? 'textSecondary' : 'textPrimary'}>
                                {notif.title}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="textSecondary" display="block" mt={0.5}>
                              {notif.message}
                            </Typography>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" sx={{ borderColor: 'rgba(255,255,255,0.04)' }} />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
