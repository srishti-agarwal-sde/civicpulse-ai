import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(11, 15, 25, 0.6)' : 'rgba(255, 255, 255, 0.8)',
        borderTop: (theme) =>
          theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <Container maxWidth="lg">
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          gap={2}
        >
          <Typography variant="body2" color="textSecondary">
            © {new Date().getFullYear()} <strong>CivicPulse AI</strong>. Measuring the health of communities through citizen-powered intelligence.
          </Typography>
          <Box display="flex" gap={3}>
            <Link href="#" color="textSecondary" variant="body2" underline="hover">
              Privacy Policy
            </Link>
            <Link href="#" color="textSecondary" variant="body2" underline="hover">
              Terms of Service
            </Link>
            <Link href="https://github.com" target="_blank" color="textSecondary" variant="body2" underline="hover">
              GitHub
            </Link>
          </Box>
        </Box>
        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.05)' }} />
        <Typography variant="caption" color="textSecondary" align="center" display="block">
          Hackathon-Ready AI-Powered Civic Platform. Powered by Google Cloud Platform, Gemini API & React.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
