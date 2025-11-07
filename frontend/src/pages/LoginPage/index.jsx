import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../../apiConfig'

// Importações do Material-UI para o tema
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, TextField, Button, Typography, Container, InputAdornment, IconButton, Alert, CssBaseline } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// 1. Definição do tema com a paleta "Inovação e Equilíbrio"
const theme = createTheme({
  palette: {
    primary: {
      main: '#4B0082', // Roxo Profundo (Inovação)
    },
    secondary: {
      main: '#98FF98', // Verde Menta (Vitalidade)
    },
    text: {
      primary: '#212529', // Cinza Escuro para textos principais
      secondary: '#6c757d', // Cinza médio para textos secundários
    },
    background: {
      default: '#FFFFFF', // Fundo branco e limpo
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // Mantém uma fonte legível
    button: {
      textTransform: 'none', // Remove o uppercase padrão dos botões
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
    // 2. Aplicando o tema a todos os componentes filhos
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        {/* CssBaseline ajuda a normalizar os estilos */}
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* 3. Título principal agora usa a cor primária do tema */}
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
            {/* O botão "Entrar" automaticamente herda a cor primária */}
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
                // Efeito hover para escurecer um pouco o botão
                '&:hover': {
                  backgroundColor: '#3a0066',
                }
              }}
            >
              {loading ? 'A entrar...' : 'Entrar'}
            </Button>
            <Typography align="center">
              Não tem registro?{' '}
              {/* 4. Link agora usa a cor primária do tema para consistência */}
              <Link to="/register" style={{ color: theme.palette.primary.main, fontWeight: 'bold', textDecoration: 'none' }}>
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