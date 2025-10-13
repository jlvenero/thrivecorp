import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Paper, Typography, TextField, Button, Grid, List, ListItem, ListItemText, IconButton,
    Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, InputAdornment, CircularProgress, Alert,
    Tooltip, Modal
} from '@mui/material';
import {
    FitnessCenter, Search, Add, Edit, Delete, FileUpload, Close
} from '@mui/icons-material';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

const ProviderDashboard = () => {
    const [gyms, setGyms] = useState([]);
    const [accessReport, setAccessReport] = useState([]);
    const [plans, setPlans] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditingPlan, setIsEditingPlan] = useState(null);
    const [isEditingGym, setIsEditingGym] = useState(null);
    const [planForm, setPlanForm] = useState({ id: null, name: '', description: '', price_per_access: '' });
    const [gymForm, setGymForm] = useState({ id: null, name: '', address: '' });
    const [isAcademyModalOpen, setAcademyModalOpen] = useState(false);
    const [isPlanModalOpen, setPlanModalOpen] = useState(false);

    const fetchAllData = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { headers: { Authorization: `Bearer ${token}` } };
            const [gymsRes, reportRes, plansRes] = await Promise.all([
                axios.get('http://localhost:3000/api/gyms', headers),
                axios.get('http://localhost:3000/api/accesses/provider-report', headers),
                axios.get('http://localhost:3000/api/plans', headers)
            ]);
            setGyms(gymsRes.data);
            setAccessReport(reportRes.data);
            setPlans(plansRes.data);
        } catch (err) {
            setError('Falha ao carregar os dados. Tente atualizar a página.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllData(); }, []);

    const handleOpenAcademyModal = () => setAcademyModalOpen(true);
    const handleCloseAcademyModal = () => {
        setAcademyModalOpen(false);
        resetGymForm();
    };

    const handleOpenPlanModal = () => setPlanModalOpen(true);
    const handleClosePlanModal = () => {
        setPlanModalOpen(false);
        resetPlanForm();
    };

    const handlePlanFormChange = (e) => setPlanForm({ ...planForm, [e.target.name]: e.target.value });
    const resetPlanForm = () => {
        setIsEditingPlan(null);
        setPlanForm({ id: null, name: '', description: '', price_per_access: '' });
    };

    const handlePlanSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const headers = { headers: { Authorization: `Bearer ${token}` } };
            if (isEditingPlan) {
                await axios.put(`http://localhost:3000/api/plans/${planForm.id}`, planForm, headers);
            } else {
                await axios.post('http://localhost:3000/api/plans', planForm, headers);
            }
            fetchAllData();
            handleClosePlanModal();
        } catch (err) { setError('Falha ao salvar o plano.'); }
    };

    const handleEditPlanClick = (plan) => {
        setIsEditingPlan(plan.id);
        setPlanForm(plan);
        handleOpenPlanModal();
    };

    const handleDeletePlanClick = async (planId) => {
        if (window.confirm("Tem certeza que deseja deletar este plano?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:3000/api/plans/${planId}`, { headers: { Authorization: `Bearer ${token}` } });
                fetchAllData();
            } catch (err) { setError('Falha ao deletar o plano.'); }
        }
    };

    const handleGymFormChange = (e) => setGymForm({ ...gymForm, [e.target.name]: e.target.value });
    const resetGymForm = () => {
        setIsEditingGym(null);
        setGymForm({ id: null, name: '', address: '' });
    };

    const handleGymSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const headers = { headers: { Authorization: `Bearer ${token}` } };
            if (isEditingGym) {
                await axios.put(`http://localhost:3000/api/gyms/${gymForm.id}`, gymForm, headers);
            } else {
                await axios.post('http://localhost:3000/api/provider/gyms', gymForm, headers);
            }
            fetchAllData();
            handleCloseAcademyModal();
        } catch (err) { setError('Falha ao salvar a academia.'); }
    };

    const handleEditGymClick = (gym) => {
        setIsEditingGym(gym.id);
        setGymForm(gym);
        handleOpenAcademyModal();
    };

    const handleDeleteGymClick = async (gymId) => {
        if (window.confirm("Tem certeza que deseja deletar esta academia?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:3000/api/gyms/${gymId}`, { headers: { Authorization: `Bearer ${token}` } });
                fetchAllData();
            } catch (err) { setError('Falha ao deletar a academia.'); }
        }
    };

    const filteredGyms = gyms.filter(gym =>
        gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gym.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, pb: 2, borderBottom: '1px solid #dee2e6' }}>
                {/* LINHA ALTERADA ABAIXO */}
                <FitnessCenter sx={{ fontSize: '2.5rem', color: '#28a745' }} /> 
                <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>Gerenciar Academias</Typography>
                    <Typography variant="body1" color="text.secondary">Gerencie suas academias, planos e visualize relatórios de check-ins</Typography>
                </Box>
            </Box>

            <TextField fullWidth variant="outlined" placeholder="Buscar por nome ou endereço..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ mb: 3, backgroundColor: 'white' }}
                InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>), }}
            />

            {loading ? <CircularProgress /> :
                <>
                    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h5" component="h3" sx={{ fontWeight: 500 }}>Minhas Academias</Typography>
                            <Tooltip title="Adicionar Nova Academia">
                                <IconButton color="success" onClick={handleOpenAcademyModal}><Add /></IconButton>
                            </Tooltip>
                        </Box>
                        <List>
                            {filteredGyms.length > 0 ? filteredGyms.map(gym => (
                                <ListItem key={gym.id} divider sx={{ py: 2 }} secondaryAction={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip label={gym.status} size="small" sx={{ textTransform: 'capitalize', fontWeight: 'bold', backgroundColor: gym.status === 'active' ? 'rgba(40, 167, 69, 0.2)' : 'rgba(255, 193, 7, 0.2)', color: gym.status === 'active' ? '#155724' : '#856404' }} />
                                        <Tooltip title="Editar"><IconButton onClick={() => handleEditGymClick(gym)}><Edit /></IconButton></Tooltip>
                                        <Tooltip title="Excluir"><IconButton color="error" onClick={() => handleDeleteGymClick(gym.id)}><Delete /></IconButton></Tooltip>
                                    </Box>
                                }>
                                    <ListItemText primary={<Typography variant="h6">{gym.name}</Typography>} secondary={gym.address} />
                                </ListItem>
                            )) : <Typography sx={{ p: 2 }}>Nenhuma academia encontrada.</Typography>}
                        </List>
                    </Paper>

                    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h5" component="h3" sx={{ fontWeight: 500 }}>Meus Planos Cadastrados</Typography>
                            <Tooltip title="Adicionar Novo Plano">
                                <IconButton color="success" onClick={handleOpenPlanModal}><Add /></IconButton>
                            </Tooltip>
                        </Box>
                        <List>
                            {plans.length > 0 ? plans.map(plan => (
                                <ListItem key={plan.id} divider sx={{ py: 2 }} secondaryAction={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="h6" sx={{ color: '#28a745', fontWeight: 'bold' }}>R$ {parseFloat(plan.price_per_access).toFixed(2)}</Typography>
                                        <Tooltip title="Editar"><IconButton onClick={() => handleEditPlanClick(plan)}><Edit /></IconButton></Tooltip>
                                        <Tooltip title="Excluir"><IconButton color="error" onClick={() => handleDeletePlanClick(plan.id)}><Delete /></IconButton></Tooltip>
                                    </Box>
                                }>
                                    <ListItemText primary={<Typography variant="h6">{plan.name}</Typography>} secondary={plan.description} />
                                </ListItem>
                            )) : <Typography sx={{ p: 2 }}>Nenhum plano cadastrado.</Typography>}
                        </List>
                    </Paper>

                    <Paper elevation={2} sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5" component="h3" sx={{ fontWeight: 500 }}>Relatório de Check-ins</Typography>
                        </Box>
                        <TableContainer>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Data e Hora</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Colaborador</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Academia</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {accessReport.length > 0 ? accessReport.map(access => (
                                        <TableRow key={access.id} hover>
                                            <TableCell>{new Date(access.access_timestamp).toLocaleString('pt-BR')}</TableCell>
                                            <TableCell>{`${access.first_name} ${access.last_name}`}</TableCell>
                                            <TableCell>{access.gym_name}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">Nenhum check-in registrado ainda.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                         {accessReport.length > 0 && <Typography variant="body2" sx={{mt: 2, textAlign: 'right', fontWeight: 500}}>Total de check-ins: {accessReport.length}</Typography>}
                    </Paper>
                </>
            }

            <Modal open={isAcademyModalOpen} onClose={handleCloseAcademyModal}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2">{isEditingGym ? 'Editar Academia' : 'Adicionar Nova Academia'}</Typography>
                    <Box component="form" onSubmit={handleGymSubmit} noValidate sx={{ mt: 2 }}>
                        <TextField label="Nome da Academia" name="name" value={gymForm.name} onChange={handleGymFormChange} fullWidth required sx={{ mb: 2 }} />
                        <TextField label="Endereço Completo" name="address" value={gymForm.address} onChange={handleGymFormChange} fullWidth required sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button onClick={handleCloseAcademyModal}>Cancelar</Button>
                            <Button type="submit" variant="contained">{isEditingGym ? 'Salvar' : 'Adicionar'}</Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>

            <Modal open={isPlanModalOpen} onClose={handleClosePlanModal}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2">{isEditingPlan ? 'Editar Plano' : 'Adicionar Novo Plano'}</Typography>
                    <Box component="form" onSubmit={handlePlanSubmit} noValidate sx={{ mt: 2 }}>
                        <TextField label="Nome do Plano" name="name" value={planForm.name} onChange={handlePlanFormChange} fullWidth required sx={{ mb: 2 }} />
                        <TextField label="Descrição do Plano" name="description" value={planForm.description} onChange={handlePlanFormChange} fullWidth multiline rows={2} required sx={{ mb: 2 }} />
                        <TextField label="Preço por Acesso" name="price_per_access" value={planForm.price_per_access} onChange={handlePlanFormChange} type="number" fullWidth required sx={{ mb: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button onClick={handleClosePlanModal}>Cancelar</Button>
                            <Button type="submit" variant="contained">{isEditingPlan ? 'Salvar' : 'Adicionar'}</Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default ProviderDashboard;