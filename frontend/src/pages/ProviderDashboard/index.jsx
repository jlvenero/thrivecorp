import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Box, Typography, Paper, List, ListItem, ListItemText, 
    IconButton, Chip, Divider, TextField, Button, Grid, 
    FormControl, InputLabel, Select, MenuItem, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Modal
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { API_URL } from '../../apiConfig';
import ConfirmationDialog from '../../components/ConfirmationDialog';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const ProviderDashboard = () => {
    const [gyms, setGyms] = useState([]);
    const [accessReport, setAccessReport] = useState([]);
    const [plans, setPlans] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditingPlan, setIsEditingPlan] = useState(false);
    
    const [planForm, setPlanForm] = useState({ id: null, gym_id: '', name: '', description: '', price_per_access: '' });
    const [gymForm, setGymForm] = useState({ id: null, name: '', address: '' });
    const [isEditingGym, setIsEditingGym] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState({ title: '', message: '', onConfirm: () => {} });

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetGymForm();
    };

    const fetchAllData = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { headers: { Authorization: `Bearer ${token}` } };

            const [gymsRes, reportRes, plansRes] = await Promise.all([
                axios.get(`${API_URL}/api/gyms`, headers),
                axios.get(`${API_URL}/api/accesses/provider-report`, headers),
                axios.get(`${API_URL}/api/plans`, headers)
            ]);

            setGyms(gymsRes.data);
            setAccessReport(reportRes.data);
            setPlans(plansRes.data);
        } catch (err) {
            setError('Falha ao carregar os dados. Tente atualizar a página.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleGymFormChange = (e) => setGymForm({ ...gymForm, [e.target.name]: e.target.value });
    const resetGymForm = () => {
        setIsEditingGym(false);
        setGymForm({ id: null, name: '', address: '' });
    };

    const handleGymSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const headers = { headers: { Authorization: `Bearer ${token}` } };
        try {
            if (isEditingGym) {
                await axios.put(`${API_URL}/api/gyms/${gymForm.id}`, gymForm, headers);
            } else {
                await axios.post(`${API_URL}/api/provider/gyms`, gymForm, headers);
            }
            handleCloseModal();
            fetchAllData();
        } catch (err) { setError('Falha ao salvar a academia.'); }
    };

    const handleAddGymClick = () => {
        resetGymForm();
        handleOpenModal();
    };

    const handleEditGymClick = (gym) => {
        setIsEditingGym(true);
        setGymForm(gym);
        handleOpenModal();
    };

    const handleDeleteGymClick = async (gymId) => {
        setDialogOpen(false);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/gyms/${gymId}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchAllData();
        } catch (err) {
            setError('Falha ao deletar a academia.');
        }
    };

    const openDeleteGymDialog = (gymId) => {
        setDialogConfig({
            title: 'Deletar Academia',
            message: 'Tem certeza que deseja deletar esta academia? Esta ação não pode ser desfeita.',
            onConfirm: () => handleDeleteGymClick(gymId)
        });
        setDialogOpen(true);
    };
    
    const handlePlanFormChange = (e) => setPlanForm({ ...planForm, [e.target.name]: e.target.value });
    const resetPlanForm = () => {
        setIsEditingPlan(false);
        setPlanForm({ id: null, gym_id: '', name: '', description: '', price_per_access: '' });
    };
    const handlePlanSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const headers = { headers: { Authorization: `Bearer ${token}` } };
        try {
            if (isEditingPlan) {
                await axios.put(`${API_URL}/api/plans/${planForm.id}`, planForm, headers);
            } else {
                await axios.post(`${API_URL}/api/plans`, planForm, headers);
            }
            resetPlanForm();
            fetchAllData();
        } catch (err) { 
            setError(err.response?.data?.error || 'Falha ao salvar o plano.'); 
        }
    };
    const handleEditPlanClick = (plan) => {
        setIsEditingPlan(true);
        setPlanForm(plan);
    };
    const handleDeletePlanClick = async (planId) => {
        setDialogOpen(false);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/plans/${planId}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchAllData();
        } catch (err) {
            setError('Falha ao deletar o plano.');
        }
    };

    const openDeletePlanDialog = (planId) => {
        setDialogConfig({
            title: 'Deletar Plano',
            message: 'Tem certeza que deseja deletar este plano? Esta ação não pode ser desfeita.',
            onConfirm: () => handleDeletePlanClick(planId)
        });
        setDialogOpen(true);
    };
    
    const gymsWithoutPlans = gyms.filter(gym => !plans.some(plan => plan.gym_id === gym.id));
    
    const plansWithGymNames = plans.map(plan => {
        const gym = gyms.find(g => g.id === plan.gym_id);
        return { ...plan, gym_name: gym ? gym.name : 'Academia não encontrada' };
    });

    if (loading) return <Typography>Carregando...</Typography>;

    return (
        <Box sx={{ padding: 3 }}>
            {error && <Typography color="error">{error}</Typography>}

            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                aria-labelledby="gym-modal-title"
            >
                <Box sx={modalStyle}>
                    <Typography id="gym-modal-title" variant="h6" component="h2">
                        {isEditingGym ? 'Editar Academia' : 'Adicionar Nova Academia'}
                    </Typography>
                    <Box component="form" onSubmit={handleGymSubmit} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}><TextField fullWidth name="name" label="Nome da Academia" value={gymForm.name} onChange={handleGymFormChange} required /></Grid>
                            <Grid item xs={12}><TextField fullWidth name="address" label="Endereço Completo" value={gymForm.address} onChange={handleGymFormChange} required /></Grid>
                            <Grid item xs={12} sm={6}><Button type="submit" variant="contained" fullWidth>{isEditingGym ? 'Salvar Alterações' : 'Adicionar Academia'}</Button></Grid>
                            <Grid item xs={12} sm={6}><Button variant="outlined" fullWidth onClick={handleCloseModal}>Cancelar</Button></Grid>
                        </Grid>
                    </Box>
                </Box>
            </Modal>

            <Paper elevation={3} sx={{ padding: 2, marginBottom: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StorefrontIcon color="primary" />
                        <Typography variant="h5">Gerenciar Academias</Typography>
                    </Box>
                    <IconButton color="primary"
                    onClick={handleAddGymClick}
                    aria-label="add-gym"
                    >
                    <AddCircleIcon sx={{ fontSize: 30 }} />
                    </IconButton>
                </Box>
                
                <List>
                    {gyms.map((gym, index) => (
                        <React.Fragment key={gym.id}>
                            <ListItem
                                secondaryAction={
                                    <>
                                        <IconButton edge="end" aria-label="edit" onClick={() => handleEditGymClick(gym)}><EditIcon /></IconButton>
                                        <IconButton edge="end" aria-label="delete" onClick={() => openDeleteGymDialog(gym.id)}><DeleteIcon /></IconButton>
                                    </>
                                }
                            >
                                <ListItemText primary={gym.name} secondary={gym.address} />
                                <Chip label={gym.status} color={gym.status === 'active' ? 'success' : 'warning'} size="small" sx={{ marginRight: '80px' }}/>
                            </ListItem>
                            {index < gyms.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>

            <Paper elevation={3} sx={{ padding: 2, marginBottom: 4 }}>
                <Typography variant="h5" gutterBottom>Gerenciar Planos</Typography>
                <Box component="form" onSubmit={handlePlanSubmit} sx={{ marginBottom: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth disabled={isEditingPlan}>
                                <InputLabel id="gym-select-label">Academia</InputLabel>
                                <Select
                                    labelId="gym-select-label"
                                    name="gym_id"
                                    value={planForm.gym_id}
                                    label="Academia"
                                    onChange={handlePlanFormChange}
                                    required
                                >
                                    {isEditingPlan ? (
                                        <MenuItem value={planForm.gym_id}>{plansWithGymNames.find(p => p.id === planForm.id)?.gym_name}</MenuItem>
                                    ) : (
                                        gymsWithoutPlans.map(gym => <MenuItem key={gym.id} value={gym.id}>{gym.name}</MenuItem>)
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}><TextField fullWidth name="name" label="Nome do Plano" value={planForm.name} onChange={handlePlanFormChange} required /></Grid>
                        <Grid item xs={12} sm={3}><TextField fullWidth name="description" label="Descrição" value={planForm.description} onChange={handlePlanFormChange} /></Grid>
                        <Grid item xs={12} sm={2}><TextField fullWidth name="price_per_access" label="Preço por Acesso" type="number" value={planForm.price_per_access} onChange={handlePlanFormChange} required /></Grid>
                        <Grid item xs={12} sm={1}><Button type="submit" variant="contained" fullWidth disabled={!isEditingPlan && gymsWithoutPlans.length === 0}>{isEditingPlan ? 'Salvar' : 'Criar'}</Button></Grid>
                        {isEditingPlan && <Grid item xs={12}><Button onClick={resetPlanForm}>Cancelar Edição</Button></Grid>}
                    </Grid>
                </Box>
                 <List>
                    {plansWithGymNames.map((plan, index) => (
                        <React.Fragment key={plan.id}>
                            <ListItem
                                secondaryAction={
                                    <>
                                        <IconButton edge="end" aria-label="edit" onClick={() => handleEditPlanClick(plan)}><EditIcon /></IconButton>
                                        <IconButton edge="end" aria-label="delete" onClick={() => openDeletePlanDialog(plan.id)}><DeleteIcon /></IconButton>
                                    </>
                                }
                            >
                                <ListItemText 
                                    primary={`${plan.name} - (Academia: ${plan.gym_name})`}
                                    secondary={plan.description}
                                />
                                 <Typography sx={{ marginRight: '80px', fontWeight:'bold', color: 'green' }}>
                                    R$ {parseFloat(plan.price_per_access).toFixed(2)}
                                </Typography>
                            </ListItem>
                            {index < plansWithGymNames.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>

            <Paper elevation={3} sx={{ padding: 2 }}>
                <Typography variant="h5" gutterBottom>Relatório de Check-ins</Typography>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="relatorio de check-ins">
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Data e Hora</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Colaborador</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Academia</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {accessReport.map((access) => (
                                <TableRow key={access.id}>
                                    <TableCell>{new Date(access.access_timestamp).toLocaleString('pt-BR')}</TableCell>
                                    <TableCell>{`${access.first_name} ${access.last_name}`}</TableCell>
                                    <TableCell>{access.gym_name}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <ConfirmationDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onConfirm={dialogConfig.onConfirm}
                title={dialogConfig.title}
                message={dialogConfig.message}
            />
        </Box>
    );
};

export default ProviderDashboard;