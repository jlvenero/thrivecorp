import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Button,
    Alert,
    CircularProgress,
    Divider,
    useTheme // Import useTheme
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'; // Ícone para academias
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Ícone para check-in
import ConfirmationDialog from '../../components/ConfirmationDialog'; // Reutilizar o diálogo de confirmação

const ColaboradorDashboard = () => {
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(true); // Iniciar como true
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState({ title: '', message: '', onConfirm: () => {} });
    const theme = useTheme(); // Obter o tema

    const fetchGyms = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(''); // Limpar mensagem de sucesso ao recarregar
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/collaborator/gyms', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filtrar academias ativas (se a API não fizer isso)
            setGyms(response.data.filter(gym => gym.status === 'active'));
        } catch (err) {
            setError('Falha ao buscar as academias disponíveis.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGyms();
    }, []);

    const handleCheckIn = async (gymId, gymName) => {
        setDialogOpen(false); // Fechar diálogo antes de processar
        setError('');
        setSuccessMessage('');
        setLoading(true); // Mostrar loading durante a requisição

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3000/api/accesses',
                { gymId: gymId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccessMessage(`Check-in em "${gymName}" realizado com sucesso!`);
        } catch (err) {
            setError(err.response?.data?.error || 'Falha ao realizar o check-in. Tente novamente.');
            console.error(err);
        } finally {
            setLoading(false); // Esconder loading
        }
    };

    // Função para abrir o diálogo de confirmação
    const openCheckInDialog = (gymId, gymName) => {
        setDialogConfig({
            title: 'Confirmar Check-in',
            message: `Você confirma o check-in na academia "${gymName}"?`,
            onConfirm: () => handleCheckIn(gymId, gymName)
        });
        setDialogOpen(true);
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <FitnessCenterIcon sx={{ color: 'primary.main', fontSize: '2.5rem' }} />
                <Typography variant="h5">Academias Disponíveis</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Faça seu check-in nas academias parceiras.
            </Typography>

            {/* Exibir Alertas */}
            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper elevation={0} sx={{ p: 0, borderRadius: '12px' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : gyms.length > 0 ? (
                    <List disablePadding>
                        {gyms.map((gym, index) => (
                            <React.Fragment key={gym.id}>
                                <ListItem
                                    secondaryAction={
                                        <Button
                                            variant="contained"
                                            color="primary" // Cor primária do tema
                                            startIcon={<CheckCircleOutlineIcon />}
                                            onClick={() => openCheckInDialog(gym.id, gym.name)}
                                            sx={{ borderRadius: '8px', fontWeight: 'bold' }} // Estilo do botão
                                        >
                                            Fazer Check-in
                                        </Button>
                                    }
                                    sx={{ py: 2, px: 3 }} // Padding interno do item da lista
                                >
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle1" sx={{ fontWeight: '600', color: 'text.primary' }}>
                                                {gym.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="body2" color="text.secondary">
                                                {gym.address}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                {index < gyms.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Typography sx={{ p: 3, textAlign: 'center' }} color="text.secondary">
                        Nenhuma academia disponível para check-in no momento.
                    </Typography>
                )}
            </Paper>

            {/* Diálogo de Confirmação */}
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

export default ColaboradorDashboard;