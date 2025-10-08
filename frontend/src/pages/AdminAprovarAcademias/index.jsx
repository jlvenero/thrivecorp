// src/pages/AdminAprovarAcademias/index.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, Paper, TextField, InputAdornment, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'; // Ícone para o título da página
import ConfirmationDialog from '../../components/ConfirmationDialog'; // Nosso modal reutilizável!

// Componente para o status (reutilizado da outra tela)
const StatusChip = ({ status }) => {
    let colors = { bg: 'default', border: 'default' };
    let label = status;
    
    if (status === 'pending') {
        colors = { bg: 'warning.light', border: 'warning.main' };
        label = 'Pendente';
    }
    if (status === 'active') {
        colors = { bg: 'success.light', border: 'success.main' };
        label = 'Aprovado'
    }

    return <Chip 
        label={label} 
        variant="outlined"
        size="small" 
        sx={{ 
            fontWeight: 'bold',
            backgroundColor: colors.bg,
            borderColor: colors.border,
            color: colors.border,
            '& .MuiChip-label': { px: '4px' }
        }} 
    />;
};


const AdminAprovarAcademias = () => {
    // 1. State alterado para 'gyms'
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState({ title: '', message: '', onConfirm: () => {} });

    // 2. Função de busca de dados alterada para o endpoint de academias
    const fetchGyms = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/gyms/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGyms(response.data);
        } catch (err) {
            setError('Falha ao buscar as academias.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGyms();
    }, []);

    const handleApprove = async (gymId) => {
        setDialogOpen(false);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3000/api/gyms/${gymId}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
            fetchGyms();
        } catch (err) { setError('Falha ao aprovar a academia.'); }
    };

    const handleReprove = async (gymId) => {
        setDialogOpen(false);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/api/gyms/${gymId}/reprove`, { headers: { Authorization: `Bearer ${token}` } });
            fetchGyms();
        } catch (err) { setError('Falha ao reprovar a academia.'); }
    };
    
    // 3. Lógica do modal adaptada para academias
    const openConfirmationDialog = (gymId, action) => {
        let config = {};
        switch (action) {
            case 'approve':
                config = {
                    title: 'Confirmar Aprovação',
                    message: 'Tem certeza que deseja aprovar o cadastro desta academia?',
                    onConfirm: () => handleApprove(gymId)
                };
                break;
            case 'reprove':
                config = {
                    title: 'Confirmar Reprovação',
                    message: 'A solicitação de cadastro desta academia será removida. Deseja continuar?',
                    onConfirm: () => handleReprove(gymId)
                };
                break;
            default: return;
        }
        setDialogConfig(config);
        setDialogOpen(true);
    };

    // 4. Lógica de filtro adaptada para academias (nome e endereço)
    const filteredGyms = gyms.filter(gym =>
        gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gym.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const counts = gyms.reduce((acc, gym) => { acc[gym.status] = (acc[gym.status] || 0) + 1; return acc; }, { pending: 0, active: 0 });

    return (
        <>
            {/* 5. Título e ícone da página atualizados */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <FitnessCenterIcon sx={{ color: 'primary.main', fontSize: '2.5rem' }} />
                <Typography variant="h5">Aprovar Academias</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Gerencie as solicitações de cadastro de academias e serviços
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper elevation={0} sx={{ p: 3, borderRadius: '12px' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar por nome ou endereço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 3 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="disabled" />
                            </InputAdornment>
                        ),
                    }}
                />

                <TableContainer>
                    <Table sx={{ '& .MuiTableCell-root': { borderBottom: 'none' } }}>
                        <TableHead>
                            {/* 6. Colunas da tabela atualizadas */}
                            <TableRow sx={{ '& .MuiTableCell-head': { color: 'text.secondary', fontWeight: '600' } }}>
                                <TableCell>Academia</TableCell>
                                <TableCell>Endereço</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} align="center">Carregando...</TableCell></TableRow>
                            ) : filteredGyms.map((gym) => (
                                <TableRow key={gym.id} hover sx={{ '& > *': { borderBottom: '1px solid #e2e8f0' } }}>
                                    <TableCell sx={{ fontWeight: '600', color: 'text.primary' }}>{gym.name}</TableCell>
                                    <TableCell>{gym.address}</TableCell>
                                    <TableCell><StatusChip status={gym.status} /></TableCell>
                                    <TableCell align="right">
                                        {gym.status === 'pending' && (
                                            <>
                                                <Tooltip title="Aprovar">
                                                    <IconButton onClick={() => openConfirmationDialog(gym.id, 'approve')} color="success">
                                                        <CheckCircleOutlineIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Reprovar">
                                                    <IconButton onClick={() => openConfirmationDialog(gym.id, 'reprove')} color="error">
                                                        <HighlightOffIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'text.secondary', p: 2 }}>
                    <Typography variant="body2">
                        Mostrando {filteredGyms.length} de {gyms.length} academias
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'warning.main' }} />
                            <Typography variant="body2">Pendente: {counts.pending}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main' }} />
                            <Typography variant="body2">Aprovado: {counts.active}</Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            <ConfirmationDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onConfirm={dialogConfig.onConfirm}
                title={dialogConfig.title}
                message={dialogConfig.message}
            />
        </>
    );
};

export default AdminAprovarAcademias;