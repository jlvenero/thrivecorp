// src/pages/AdminAprovarEmpresas/index.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, Paper, TextField, InputAdornment, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BusinessIcon from '@mui/icons-material/Business';
import ConfirmationDialog from '../../components/ConfirmationDialog';

// Componente StatusChip (sem alterações)
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

const AdminAprovarEmpresas = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true); // Inicia como true
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState({ title: '', message: '', onConfirm: () => {} });

    // ESTE BLOCO ESTAVA FALTANDO, CAUSANDO O ERRO DA TELA VAZIA
    const fetchCompanies = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/companies', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCompanies(response.data);
        } catch (err) {
            setError('Falha ao buscar as empresas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);
    // FIM DO BLOCO CORRIGIDO

    const handleApprove = async (companyId) => {
        setDialogOpen(false); // Fecha o modal primeiro
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3000/api/companies/${companyId}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
            fetchCompanies();
        } catch (err) { setError('Falha ao aprovar a empresa.'); }
    };

    const handleReject = async (companyId) => {
        setDialogOpen(false);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/api/companies/${companyId}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchCompanies();
        } catch (err) { setError('Falha ao rejeitar a empresa.'); }
    };

    const handleDelete = async (companyId) => {
        setDialogOpen(false);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/api/companies/${companyId}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchCompanies();
        } catch (err) { setError('Falha ao excluir a empresa.'); }
    };

    const openConfirmationDialog = (companyId, action) => {
        let config = {};
        switch (action) {
            case 'approve':
                config = {
                    title: 'Confirmar Aprovação',
                    message: 'Tem certeza que deseja aprovar o cadastro desta empresa?',
                    onConfirm: () => handleApprove(companyId)
                };
                break;
            case 'reject':
                config = {
                    title: 'Confirmar Rejeição',
                    message: 'A solicitação desta empresa será removida. Deseja continuar?',
                    onConfirm: () => handleReject(companyId)
                };
                break;
            case 'delete':
                config = {
                    title: 'Confirmar Exclusão',
                    message: 'ATENÇÃO: A empresa e seu administrador serão desativados permanentemente. Esta ação não pode ser desfeita.',
                    onConfirm: () => handleDelete(companyId)
                };
                break;
            default: return;
        }
        setDialogConfig(config);
        setDialogOpen(true);
    };

    const filteredCompanies = companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.cnpj.includes(searchTerm));
    const counts = companies.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, { pending: 0, active: 0 });

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <BusinessIcon sx={{ color: 'primary.main', fontSize: '2.5rem' }} />
                <Typography variant="h5">Aprovar Empresas</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Gerencie as solicitações de cadastro de empresas
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper elevation={0} sx={{ p: 3, borderRadius: '12px' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar por nome ou CNPJ..."
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
                            <TableRow sx={{ '& .MuiTableCell-head': { color: 'text.secondary', fontWeight: '600' } }}>
                                <TableCell>Empresa</TableCell>
                                <TableCell>CNPJ</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} align="center">Carregando...</TableCell></TableRow>
                            ) : filteredCompanies.map((company) => (
                                <TableRow key={company.id} hover sx={{ '& > *': { borderBottom: '1px solid #e2e8f0' } }}>
                                    <TableCell sx={{ fontWeight: '600', color: 'text.primary' }}>{company.name}</TableCell>
                                    <TableCell>{company.cnpj}</TableCell>
                                    <TableCell><StatusChip status={company.status} /></TableCell>
                                    <TableCell align="right">
                                        {company.status === 'pending' && (
                                            <>
                                                <Tooltip title="Aprovar">
                                                    <IconButton onClick={() => openConfirmationDialog(company.id, 'approve')} color="success">
                                                        <CheckCircleOutlineIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Rejeitar">
                                                    <IconButton onClick={() => openConfirmationDialog(company.id, 'reject')} color="error">
                                                        <HighlightOffIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                        <Tooltip title="Excluir">
                                            <IconButton onClick={() => openConfirmationDialog(company.id, 'delete')} color="error">
                                                <DeleteOutlineIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'text.secondary', p: 2 }}>
                     <Typography variant="body2">
                        Mostrando {filteredCompanies.length} de {companies.length} empresas
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

export default AdminAprovarEmpresas;