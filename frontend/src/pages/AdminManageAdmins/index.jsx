import React, { useState } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Stack,
    Divider
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { API_URL } from '../../apiConfig'

const AdminManageAdmins = () => {
    const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/admin/admins`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess(`Administrador "${formData.first_name}" criado com sucesso!`);
            setFormData({ first_name: '', last_name: '', email: '', password: '' });
        } catch (err) {
            setError(err.response?.data?.error || 'Falha ao criar administrador.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <AdminPanelSettingsIcon sx={{ color: 'primary.main', fontSize: '2.5rem' }} />
                <Typography variant="h5">
                    Gerenciar Administradores ThriveCorp
                </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Adicione novos usuários com permissão de administrador na plataforma.
            </Typography>

            <Paper elevation={0} sx={{ p: 4, borderRadius: '12px', maxWidth: '600px' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                    Adicionar Novo Administrador
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        {error && <Alert severity="error">{error}</Alert>}
                        {success && <Alert severity="success">{success}</Alert>}

                        <TextField
                            label="Primeiro Nome"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Sobrenome"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Senha Provisória"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <Box sx={{ pt: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={loading}
                                fullWidth
                                size="large"
                                sx={{ py: 1.5, fontWeight: 'bold' }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Criar Administrador'}
                            </Button>
                        </Box>
                    </Stack>
                </Box>
            </Paper>
        </>
    );
};

export default AdminManageAdmins;