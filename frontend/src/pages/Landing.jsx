import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Typography, Button, Grid, Card, CardContent, Stack, keyframes } from '@mui/material';
import {
  Campaign,
  AutoAwesome,
  Explore,
  Psychology,
  Group,
  MilitaryTech,
} from '@mui/icons-material';

// Custom micro-animations
const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.05); opacity: 1; box-shadow: 0 0 25px rgba(0, 229, 255, 0.4); }
  100% { transform: scale(1); opacity: 0.9; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const Landing = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'radial-gradient(circle at 80% 20%, rgba(0, 229, 255, 0.08) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(255, 109, 0, 0.05) 0%, transparent 50%)'
              : 'radial-gradient(circle at 80% 20%, rgba(0, 96, 100, 0.05) 0%, transparent 50%)',
          pt: { xs: 8, md: 14 },
          pb: { xs: 8, md: 12 },
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Container maxWidth="md">
          {/* Animated Tech Banner */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.8,
              borderRadius: 5,
              border: '1px solid rgba(0, 229, 255, 0.2)',
              bgcolor: 'background.paper',
              mb: 3,
              animation: `${float} 4s ease-in-out infinite`,
            }}
          >
            <AutoAwesome color="primary" sx={{ fontSize: 16 }} />
            <Typography variant="caption" fontWeight={700} color="primary">
              AI-Powered Civic Intelligence
            </Typography>
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              fontWeight: 900,
              lineHeight: 1.1,
              mb: 3,
              background: 'linear-gradient(45deg, #00e5ff 10%, #ff6d00 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CivicPulse AI
          </Typography>

          <Typography
            variant="h5"
            color="textSecondary"
            sx={{
              fontWeight: 500,
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
              mb: 6,
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            "Measuring the health of communities through citizen-powered intelligence."
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              component={Link}
              to="/dashboard"
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.8,
                fontSize: '1rem',
                borderRadius: 4,
                animation: `${pulse} 3s infinite ease-in-out`,
              }}
            >
              Enter Dashboard
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="outlined"
              size="large"
              sx={{ px: 4, py: 1.8, fontSize: '1rem', borderRadius: 4 }}
            >
              Join the Network
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Feature Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" align="center" fontWeight={800} sx={{ mb: 8, fontSize: { xs: '2rem', md: '3rem' } }}>
          Core Infrastructure
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}><Campaign sx={{ fontSize: 40 }} /></Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Geospatial Reporting
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Submit detailed civic issues with current device GPS or precise Leaflet map pins. Attach photos and video evidence.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}><Psychology sx={{ fontSize: 40 }} /></Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Gemini API Analysis
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Gemini automatically classifies issues, generates severity and impact metrics, outlines recommended actions, and estimates confidence levels.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}><Explore sx={{ fontSize: 40 }} /></Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Duplicate Detection
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Geospatial proximity search checks for similar issues within 500m before submission, allowing citizens to join reports instead of duplicating.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}><Group sx={{ fontSize: 40 }} /></Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Community Validation
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Citizens collaborate by upvoting, confirming occurrences, adding comment updates, and voting consensus resolutions.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}><MilitaryTech sx={{ fontSize: 40 }} /></Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Reputation System
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Earn points and unlock unique community badges (e.g. Civic Guardian, Community Hero) for helping keep civic registries clean.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}><AutoAwesome sx={{ fontSize: 40 }} /></Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Civic Health Index
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Dynamic calculations weigh active counts, average hazard severity, resolution rates, and participation score trends to evaluate health.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Landing;
