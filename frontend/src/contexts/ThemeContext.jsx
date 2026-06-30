import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true; // Default to dark mode for premium tech feel
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  // Deep slate, neon teal, electric orange, hot crimson
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#00e5ff' : '#006064', // Neon Cyan / Dark Teal
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#ff6d00', // Electric Amber / Orange
      },
      background: {
        default: darkMode ? '#0b0f19' : '#f4f6fa', // Space blue vs Clean light-grey
        paper: darkMode ? '#151c2c' : '#ffffff',
        card: darkMode ? 'rgba(21, 28, 44, 0.7)' : 'rgba(255, 255, 255, 0.9)',
      },
      error: {
        main: '#ff1744', // Hot Crimson
      },
      warning: {
        main: '#ffea00', // Neon Yellow
      },
      success: {
        main: '#00e676', // Bright Emerald
      },
      info: {
        main: '#2979ff', // Radiant Blue
      },
      text: {
        primary: darkMode ? '#e3ebf6' : '#1e293b',
        secondary: darkMode ? '#94a3b8' : '#64748b',
      },
    },
    typography: {
      fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 800,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundImage: 'none',
            boxShadow: darkMode
              ? '0 4px 20px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
              : '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
            border: darkMode
              ? '1px solid rgba(255, 255, 255, 0.06)'
              : '1px solid rgba(0, 0, 0, 0.04)',
            backdropFilter: 'blur(10px)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: darkMode
                ? '0 8px 30px 0 rgba(0, 229, 255, 0.15)'
                : '0 8px 30px 0 rgba(0, 96, 100, 0.1)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '8px 16px',
            boxShadow: 'none',
          },
          containedPrimary: {
            background: darkMode
              ? 'linear-gradient(135deg, #00b0ff 0%, #00e5ff 100%)'
              : 'linear-gradient(135deg, #006064 0%, #00838f 100%)',
            boxShadow: darkMode
              ? '0 4px 14px 0 rgba(0, 229, 255, 0.3)'
              : '0 4px 14px 0 rgba(0, 96, 100, 0.2)',
            '&:hover': {
              boxShadow: darkMode
                ? '0 6px 20px 0 rgba(0, 229, 255, 0.4)'
                : '0 6px 20px 0 rgba(0, 96, 100, 0.3)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? 'rgba(11, 15, 25, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            boxShadow: 'none',
            borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
          },
          head: {
            fontWeight: 700,
            backgroundColor: darkMode ? '#111827' : '#f1f5f9',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
