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

// TEMA LOCAL: Definindo a cor principal com o valor desejado (#1e293b)
const BLUE_COLOR = '#1e293b';

const localTheme = createTheme({
  palette: {
    primary: {
      main: BLUE_COLOR, // Aplicando #1e293b
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 'bold',
      color: 'white', // FORÇA O TEXTO DO BOTÃO A SER BRANCO
    },
  },
});

const LogoIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill={localTheme.palette.primary.main}/> 
        <path d="M7 6H17M7 12H17M7 18H13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const maskDocument = (value) => {
    // 1. Limpa o valor (mantém apenas números)
    let cleanedValue = value.replace(/\D/g, '');

    // 2. Limita o tamanho (máximo 14 para CNPJ)
    cleanedValue = cleanedValue.substring(0, 14);

    if (cleanedValue.length <= 11) {
        // CPF (11 dígitos): 000.000.000-00
        return cleanedValue
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        // CNPJ (12 a 14 dígitos): 00.000.000/0000-00
        return cleanedValue
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2') 
            .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
};
// --------------------------------------------------

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', password: '', confirmPassword: '', role: 'company_admin',
        company_name: '', company_cnpj: '', company_address: '', 
        provider_name: '', provider_cnpj: '', provider_address: '',
    });
    
    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const validateForm = () => {
        let errors = {};
        let isValid = true;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,3})?$/;
        
        if (!formData.email || !emailRegex.test(formData.email)) {
            errors.email = 'E-mail inválido. Verifique o formato (ex: nome@dominio.com ou nome@dominio.com.br).';
            isValid = false;
        }

        if (formData.password.length < 8) {
            errors.password = 'A senha deve ter no mínimo 8 caracteres.';
            isValid = false;
        }
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'As senhas não coincidem.';
            isValid = false;
        }

        const docField = formData.role === 'company_admin' ? 'company_cnpj' : 'provider_cnpj';
        const docValue = formData[docField];
        
        const cleanedDoc = docValue.replace(/\D/g, '');

        if (!docValue) {
            errors[docField] = `${formData.role === 'company_admin' ? 'CNPJ' : 'Documento'} é obrigatório.`;
            isValid = false;
        } else if (cleanedDoc.length !== 14 && cleanedDoc.length !== 11) {
             errors[docField] = 'O documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ).';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleDocumentChange = (e) => {
        const { name, value } = e.target;
        const maskedValue = maskDocument(value);

        setFormData(prev => ({ ...prev, [name]: maskedValue }));

        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (formErrors[e.target.name]) {
            setFormErrors(prev => ({ ...prev, [e.target.name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!validateForm()) {
            setLoading(false);
            return;
        }

        setLoading(true);

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
        <ThemeProvider theme={localTheme}>
             <Box sx={{ 
                    minHeight: '100vh', 
                    bgcolor: 'background.default', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    py: 4
                }}
            >
                <Container component="main" maxWidth="sm" sx={{ bgcolor: 'white', borderRadius: 2, p: 3, boxShadow: 3 }}>
                    <CssBaseline />
                    <Box sx={{ marginTop: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                                
                                <Grid item xs={12}>
                                    <TextField 
                                        name="email" 
                                        required 
                                        fullWidth 
                                        label="Email" 
                                        type="email" 
                                        value={formData.email} 
                                        onChange={handleFormChange} 
                                        error={!!formErrors.email}
                                        helperText={formErrors.email}
                                    />
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <TextField 
                                        name="password" 
                                        required 
                                        fullWidth 
                                        label="Senha" 
                                        type={showPassword ? 'text' : 'password'} 
                                        value={formData.password} 
                                        onChange={handleFormChange} 
                                        error={!!formErrors.password}
                                        helperText={formErrors.password || 'Mínimo de 8 caracteres.'}
                                        InputProps={{ endAdornment: (
                                            <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                                        )}} 
                                    />
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <TextField 
                                        name="confirmPassword" 
                                        required 
                                        fullWidth 
                                        label="Confirme a Senha" 
                                        type={showConfirmPassword ? 'text' : 'password'} 
                                        value={formData.confirmPassword} 
                                        onChange={handleFormChange} 
                                        error={!!formErrors.confirmPassword}
                                        helperText={formErrors.confirmPassword}
                                        InputProps={{ endAdornment: (
                                            <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                                        )}} 
                                    />
                                </Grid>
                                
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
                                        <Grid item xs={12}>
                                            <TextField 
                                                name="company_cnpj" 
                                                required 
                                                fullWidth 
                                                label="CNPJ da Empresa (00.000.000/0000-00)" 
                                                value={formData.company_cnpj} 
                                                onChange={handleDocumentChange}
                                                error={!!formErrors.company_cnpj}
                                                helperText={formErrors.company_cnpj}
                                                inputProps={{ maxLength: 18 }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}><TextField name="company_address" required fullWidth label="Endereço da Empresa" value={formData.company_address} onChange={handleFormChange} /></Grid>
                                    </>
                                ) : (
                                    <>
                                        <Grid item xs={12}><TextField name="provider_name" required fullWidth label="Nome do Fornecedor" value={formData.provider_name} onChange={handleFormChange} /></Grid>
                                        <Grid item xs={12}>
                                            <TextField 
                                                name="provider_cnpj" 
                                                required 
                                                fullWidth 
                                                label="Documento Federal (CNPJ/CPF)" 
                                                value={formData.provider_cnpj} 
                                                onChange={handleDocumentChange}
                                                error={!!formErrors.provider_cnpj}
                                                helperText={formErrors.provider_cnpj}
                                                inputProps={{ maxLength: 18 }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}><TextField name="provider_address" required fullWidth label="Endereço do Fornecedor" value={formData.provider_address} onChange={handleFormChange} /></Grid>
                                    </>
                                )}
                            </Grid>
                            
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
                                {loading ? 'Criando conta...' : 'Criar conta'}
                            </Button>
                            <Typography align="center">
                                Já tem uma conta?{' '}
                                <Link to="/login" style={{ color: localTheme.palette.primary.main, fontWeight: 'bold', textDecoration: 'none' }}>
                                    Faça login
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default RegisterPage;