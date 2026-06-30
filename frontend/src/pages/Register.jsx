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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { Campaign } from '@mui/icons-material';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return setError('Please fill in all fields');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await register(name, email, password, role);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed.');
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
              Join the smart community monitoring network
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
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <FormControl component="fieldset" sx={{ mt: 2, width: '100%', textAlign: 'left' }}>
                <FormLabel component="legend" sx={{ fontSize: 13, color: 'text.secondary' }}>
                  Register Account Role
                </FormLabel>
                <RadioGroup row value={role} onChange={(e) => setRole(e.target.value)}>
                  <FormControlLabel value="citizen" control={<Radio size="small" />} label="Citizen" />
                  <FormControlLabel value="admin" control={<Radio size="small" />} label="Administrator" />
                </RadioGroup>
              </FormControl>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={submitting}
                sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 3 }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Register'}
              </Button>

              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#00e5ff', textDecoration: 'none', fontWeight: 600 }}>
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Register;
