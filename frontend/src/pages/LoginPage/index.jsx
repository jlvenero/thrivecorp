// frontend/src/pages/LoginPage/index.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../../apiConfig'

// Importações do Material-UI
import { createTheme, ThemeProvider } from '@mui/material/styles'; // Adicionado
import { Box, TextField, Button, Typography, Container, InputAdornment, IconButton, Alert, CssBaseline } from '@mui/material'; // Adicionado CssBaseline
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Tema Local: Definindo a cor principal AZUL
const localTheme = createTheme({
  palette: {
    primary: {
      main: '#1e293b', // AZUL ESCURO PADRÃO
    },
    secondary: {
      main: '#98FF98', 
    },
    text: {
      primary: '#212529', 
      secondary: '#6c757d', 
    },
    background: {
      default: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 'bold',
    },
  },
});


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.user.role);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('Falha no login. Verifique o seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  return (
    // Aplicação do tema local
    <ThemeProvider theme={localTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline /> 
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
            ThriveCorp
          </Typography>
          <Typography component="p" sx={{ color: 'text.secondary', mb: 4 }}>
            Entre na sua conta
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1rem',
              }}
            >
              {loading ? 'A entrar...' : 'Entrar'}
            </Button>
            <Typography align="center">
              Não tem registro?{' '}
              <Link to="/register" style={{ color: localTheme.palette.primary.main, fontWeight: 'bold', textDecoration: 'none' }}>
                Crie a sua conta
              </Link>
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 8, mb: 4 }}>
          © {new Date().getFullYear()} ThriveCorp. Todos os direitos reservados.
        </Typography>
      </Container>
    </ThemeProvider>
  );
};

export default LoginPage;