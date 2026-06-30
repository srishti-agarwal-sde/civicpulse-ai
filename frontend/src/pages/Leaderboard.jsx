import React, { useState, useEffect } from 'react';
import issueService from '../services/issueService';
import LeaderboardTable from '../components/LeaderboardTable';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Divider,
} from '@mui/material';
import { EmojiEvents, Star, TrendingUp } from '@mui/icons-material';

const Leaderboard = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const res = await issueService.getLeaderboard();
        if (res.success) {
          setRankings(res.data);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Extract Podium Winners
  const podiumUsers = rankings.slice(0, 3);
  const remainingUsers = rankings.slice(3);

  // Reorder podium as: 2nd place, 1st place, 3rd place for visual podium aesthetics
  const orderedPodium = [];
  if (podiumUsers[1]) orderedPodium.push({ ...podiumUsers[1], place: 2 });
  if (podiumUsers[0]) orderedPodium.push({ ...podiumUsers[0], place: 1 });
  if (podiumUsers[2]) orderedPodium.push({ ...podiumUsers[2], place: 3 });

  const getPodiumColor = (place) => {
    if (place === 1) return '#ffd700'; // Gold
    if (place === 2) return '#c0c0c0'; // Silver
    return '#cd7f32'; // Bronze
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Top Header */}
      <Box textAlign="center" mb={6}>
        <Box display="flex" justifyContent="center" alignItems="center" gap={1} mb={2}>
          <EmojiEvents color="secondary" sx={{ fontSize: 36 }} />
          <Typography variant="h3" fontWeight={900} sx={{ background: 'linear-gradient(45deg, #00e5ff 30%, #ff6d00 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Community Standings
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary" maxWidth={600} mx="auto">
          Meet our active community champions validating and reporting issues to preserve town infrastructure. Join the grid to unlock badges!
        </Typography>
      </Box>

      {/* Podium Grid (Only render if users exist) */}
      {podiumUsers.length > 0 && (
        <Grid container spacing={3} justifyContent="center" alignItems="flex-end" sx={{ mb: 8 }}>
          {orderedPodium.map((user) => {
            const isFirst = user.place === 1;
            const color = getPodiumColor(user.place);

            return (
              <Grid
                item
                xs={12}
                sm={4}
                key={user._id}
                sx={{
                  order: { xs: user.place, sm: 'initial' }, // visually orders 2, 1, 3 on larger screens
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Card
                  sx={{
                    width: '100%',
                    maxWidth: 280,
                    pt: isFirst ? 4 : 2,
                    pb: 3,
                    textAlign: 'center',
                    border: `2px solid ${color}`,
                    boxShadow: `0 0 20px ${color}30`,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(21, 28, 44, 0.8)' : 'rgba(255, 255, 255, 0.95)',
                    transform: isFirst ? { sm: 'scale(1.08)' } : 'none',
                    zIndex: isFirst ? 2 : 1,
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="center" position="relative" mb={2}>
                      <Avatar
                        sx={{
                          width: isFirst ? 76 : 64,
                          height: isFirst ? 76 : 64,
                          bgcolor: 'primary.main',
                          border: `3px solid ${color}`,
                          fontSize: 24,
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: -10,
                          bgcolor: color,
                          color: '#111',
                          borderRadius: '50%',
                          width: 24,
                          height: 24,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: 12,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        }}
                      >
                        {user.place}
                      </Box>
                    </Box>

                    <Typography variant="h6" fontWeight={800} sx={{ mt: 2 }}>
                      {user.name}
                    </Typography>
                    
                    <Box display="flex" justifyContent="center" alignItems="center" gap={0.5} my={1}>
                      <Star sx={{ color: '#ffea00', fontSize: 18 }} />
                      <Typography variant="body2" fontWeight={800}>
                        {user.reputationScore} Rep
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />

                    <Typography variant="caption" color="textSecondary" display="block">
                      {user.reportCount} reports submitted
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block">
                      {user.validationCount} validations cast
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Remaining rankings in detailed list view */}
      {rankings.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <TrendingUp color="primary" />
            <Typography variant="h6" fontWeight={800}>
              Rank Standings Registry
            </Typography>
          </Box>
          <LeaderboardTable rankings={rankings} />
        </Box>
      )}
    </Container>
  );
};

export default Leaderboard;
