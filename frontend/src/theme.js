import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    logo: {
      main: '#6ee7b7',
    },
    primary: {
      main: '#22c55e',
    },
    secondary: {
      main: '#1e293b',
    },
    background: {
      default: '#f1f5f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    warning: {
      main: '#f59e0b',
      light: '#fef3c7',
    },
    success: {
      main: '#10b981',
      light: '#d1fae5',
    },
    error: {
      main: '#ef4444',
      light: '#fee2e2',
    },
  },
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    h5: {
      fontWeight: 700,
      color: '#0f172a', 
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
});