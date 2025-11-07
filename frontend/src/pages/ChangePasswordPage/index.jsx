import React, { useState } from 'react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Stack,
    Link,
    IconButton,
    InputAdornment
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { API_URL } from '../../apiConfig'

const ChangePasswordPage = () => {
    const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Estados para controlar a visibilidade das senhas
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('A nova senha e a confirmação não coincidem.');
            return;
        }

        if (formData.newPassword.length < 3) { // Exemplo de validação simples
            setError('A nova senha deve ter pelo menos 3 caracteres.');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/auth/change-password`, {
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Senha alterada com sucesso!');
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.error || 'Falha ao alterar a senha. Verifique sua senha antiga.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <LockResetIcon sx={{ color: 'primary.main', fontSize: '2.5rem' }} />
                <Typography variant="h5">Alterar Senha</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Para sua segurança, recomendamos o uso de uma senha forte.
            </Typography>

            <Paper elevation={0} sx={{ p: 4, borderRadius: '12px', maxWidth: '500px' }}>
                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                            Atualize sua senha
                        </Typography>

                        {error && <Alert severity="error">{error}</Alert>}
                        {success && <Alert severity="success">{success}</Alert>}

                        <TextField
                            label="Senha Atual"
                            name="oldPassword"
                            type={showOldPassword ? 'text' : 'password'}
                            value={formData.oldPassword}
                            onChange={handleChange}
                            required
                            fullWidth
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowOldPassword(!showOldPassword)} edge="end">
                                            {showOldPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            label="Nova Senha"
                            name="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                            fullWidth
                             InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            label="Confirme a Nova Senha"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            fullWidth
                             InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Box sx={{ pt: 2, textAlign: 'center' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={loading}
                                size="large"
                                sx={{ py: 1.5, fontWeight: 'bold', width: '100%', mb: 2 }}
                            >
                                {loading ? <CircularProgress size={26} color="inherit" /> : 'Alterar Senha'}
                            </Button>
                            <Link component={RouterLink} to="/dashboard" underline="hover">
                                Voltar para o Dashboard
                            </Link>
                        </Box>
                    </Stack>
                </Box>
            </Paper>
        </>
    );
};

export default ChangePasswordPage;