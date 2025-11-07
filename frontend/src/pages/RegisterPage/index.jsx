import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../apiConfig'

// Importações do Material-UI
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
    Box, TextField, Button, Typography, Container, InputAdornment,
    IconButton, Alert, Grid, MenuItem, Select, FormControl, InputLabel, CssBaseline
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Tema (pode ser movido para um arquivo separado como theme.js)
const theme = createTheme({
  palette: {
    primary: { main: '#4B0082' },
    secondary: { main: '#98FF98' },
    text: { primary: '#212529', secondary: '#6c757d' },
    background: { default: '#FFFFFF' },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    button: { textTransform: 'none', fontWeight: 'bold' },
  },
});

const LogoIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill={theme.palette.primary.main}/>
        <path d="M7 6H17M7 12H17M7 18H13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const RegisterPage = () => {
    // 1. ADICIONADO 'company_address' AO ESTADO INICIAL
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', password: '', confirmPassword: '', role: 'company_admin',
        company_name: '', company_cnpj: '', company_address: '', // <-- ADICIONADO AQUI
        provider_name: '', provider_cnpj: '', provider_address: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        try {
            await axios.post(`${API_URL}/api/auth/register`, formData);
            navigate('/pending-approval', { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || 'Falha no registro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="sm">
                <CssBaseline />
                <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <LogoIcon />
                    <Typography component="h1" variant="h4" sx={{ mt: 1, fontWeight: 'bold', color: 'primary.main' }}>
                        ThriveCorp
                    </Typography>
                    <Typography component="p" sx={{ color: 'text.secondary', mb: 3 }}>
                        Crie a sua conta
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <Grid container spacing={2}>
                            {error && <Grid item xs={12}><Alert severity="error">{error}</Alert></Grid>}
                            
                            <Grid item xs={12} sm={6}><TextField name="first_name" required fullWidth label="Primeiro Nome" value={formData.first_name} onChange={handleFormChange} /></Grid>
                            <Grid item xs={12} sm={6}><TextField name="last_name" required fullWidth label="Sobrenome" value={formData.last_name} onChange={handleFormChange} /></Grid>
                            
                            <Grid item xs={12}><TextField name="email" required fullWidth label="Email" type="email" value={formData.email} onChange={handleFormChange} /></Grid>
                            <Grid item xs={12}><TextField name="password" required fullWidth label="Senha" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleFormChange} InputProps={{ endAdornment: (
                                <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                            )}} /></Grid>
                            <Grid item xs={12}><TextField name="confirmPassword" required fullWidth label="Confirmar Senha" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleFormChange} InputProps={{ endAdornment: (
                                <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                            )}} /></Grid>
                            
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="role-select-label">Tipo de Conta</InputLabel>
                                    <Select labelId="role-select-label" name="role" value={formData.role} label="Tipo de Conta" onChange={handleFormChange}>
                                        <MenuItem value="company_admin">Administrador de Empresa</MenuItem>
                                        <MenuItem value="provider">Fornecedor (Academia)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                            {formData.role === 'company_admin' ? (
                                <>
                                    <Grid item xs={12}><TextField name="company_name" required fullWidth label="Nome da Empresa" value={formData.company_name} onChange={handleFormChange} /></Grid>
                                    <Grid item xs={12}><TextField name="company_cnpj" required fullWidth label="CNPJ da Empresa" value={formData.company_cnpj} onChange={handleFormChange} /></Grid>
                                    {/* 2. ADICIONADO CAMPO DE ENDEREÇO DA EMPRESA */}
                                    <Grid item xs={12}><TextField name="company_address" required fullWidth label="Endereço da Empresa" value={formData.company_address} onChange={handleFormChange} /></Grid>
                                </>
                            ) : (
                                <>
                                    <Grid item xs={12}><TextField name="provider_name" required fullWidth label="Nome do Fornecedor" value={formData.provider_name} onChange={handleFormChange} /></Grid>
                                    <Grid item xs={12}><TextField name="provider_cnpj" required fullWidth label="CNPJ do Fornecedor" value={formData.provider_cnpj} onChange={handleFormChange} /></Grid>
                                    <Grid item xs={12}><TextField name="provider_address" required fullWidth label="Endereço do Fornecedor" value={formData.provider_address} onChange={handleFormChange} /></Grid>
                                </>
                            )}
                        </Grid>
                        
                        <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem', '&:hover': { backgroundColor: '#3a0066' } }}>
                            {loading ? 'Criando conta...' : 'Criar conta'}
                        </Button>
                        <Typography align="center">
                            Já tem uma conta?{' '}
                            <Link to="/login" style={{ color: theme.palette.primary.main, fontWeight: 'bold', textDecoration: 'none' }}>
                                Faça login
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default RegisterPage;