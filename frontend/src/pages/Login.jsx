import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Campaign } from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please fill in all fields');
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 50% 50%, rgba(0, 229, 255, 0.05) 0%, transparent 60%)'
            : 'inherit',
      }}
    >
      <Container maxWidth="xs">
        <Card
          sx={{
            backdropFilter: 'blur(16px)',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(21, 28, 44, 0.6)' : 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(0, 229, 255, 0.15)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
            borderRadius: 4,
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
              <Campaign color="primary" sx={{ fontSize: 40, mr: 1 }} />
              <Typography variant="h5" fontWeight={800} color="textPrimary">
                CivicPulse AI
              </Typography>
            </Box>

            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Access citizen intelligence reporting network
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                slotProps={{
                  inputLabel: { shrink: true }
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{
                  inputLabel: { shrink: true }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={submitting}
                sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 3 }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>

              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#00e5ff', textDecoration: 'none', fontWeight: 600 }}>
                  Register here
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
