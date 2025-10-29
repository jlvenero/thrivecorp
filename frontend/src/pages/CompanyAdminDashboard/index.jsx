import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, Paper, TextField, Button, Grid, Modal, List,
    ListItem, ListItemText, Divider, IconButton, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, InputLabel, FormControl,
    Tooltip // <-- Adicionado Tooltip
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import DownloadIcon from '@mui/icons-material/Download'; // <-- Importado Ícone de Download
import './CompanyAdminDashboard.css';

// Estilo para o Modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const CompanyAdminDashboard = () => {
    // Estados para os dados
    const [collaborators, setCollaborators] = useState([]);
    const [accessReport, setAccessReport] = useState([]);

    // Estados de controle da interface
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Estado para o formulário de novo colaborador
    const [newCollaborator, setNewCollaborator] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: ''
    });

    // Estado para os filtros de data do relatório
    const [selectedDate, setSelectedDate] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    });

    // Funções de controle do Modal
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setNewCollaborator({ first_name: '', last_name: '', email: '', password: '' });
    };

    const fetchCollaborators = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { headers: { Authorization: `Bearer ${token}` } };
            const collaboratorsResponse = await axios.get('http://localhost:3000/api/company/collaborators', headers);
            setCollaborators(collaboratorsResponse.data);
        } catch (err) {
            setError('Falha ao buscar a lista de colaboradores.');
            console.error(err);
        }
    };

    const fetchAccessReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/accesses/company-details-report`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { year: selectedDate.year, month: selectedDate.month }
            });
            setAccessReport(response.data);
        } catch (err) {
            setError('Falha ao buscar o relatório de acessos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollaborators();
    }, []);

    useEffect(() => {
        fetchAccessReport();
    }, [selectedDate]);

    // Handlers para os formulários e filtros
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setSelectedDate(prev => ({ ...prev, [name]: parseInt(value) }));
    };

    const handleFormChange = (e) => {
        setNewCollaborator({ ...newCollaborator, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:3000/api/company/collaborators`, newCollaborator, {
                headers: { Authorization: `Bearer ${token}` }
            });
            handleCloseModal();
            fetchCollaborators();
        } catch (err) {
            setError(err.response?.data?.error || 'Falha ao criar o colaborador.');
        }
    };

    const handleDeactivate = async (collaboratorId) => {
        if (window.confirm("Tem certeza que deseja desativar este colaborador?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`http://localhost:3000/api/company/collaborators/${collaboratorId}/deactivate`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchCollaborators();
            } catch (err) {
                setError('Falha ao desativar o colaborador.');
            }
        }
    };

    const handleDownload = async () => {
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/accesses/download-company-report`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { year: selectedDate.year, month: selectedDate.month },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const fileName = `relatorio-thrivecorp-${selectedDate.year}-${selectedDate.month}.csv`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (err) {
            setError('Falha ao baixar o relatório. Verifique se existem dados no período selecionado.');
        }
    };

    // *** NOVA FUNÇÃO PARA DOWNLOAD DE COLABORADORES ***
    const handleDownloadCollaborators = () => {
        setError(null); // Limpa erro anterior

        // Filtra para garantir que apenas colaboradores ativos sejam exportados (redundante se a API já filtra)
        const activeCollaborators = collaborators.filter(c => c.status === 'active');

        if (!activeCollaborators || activeCollaborators.length === 0) {
            setError('Não há colaboradores ativos para exportar.');
            return;
        }

        // 1. Definir Cabeçalhos
        const headers = [
            'Primeiro Nome',
            'Sobrenome',
            'Email'
        ];

        // Função auxiliar para escapar aspas duplas dentro dos campos
        const escapeCsvCell = (cellData) => {
            const stringData = String(cellData || ''); // Garante que é string
            if (stringData.includes('"') || stringData.includes(';') || stringData.includes('\n')) {
                // Se contém aspas, ponto-e-vírgula ou nova linha, coloca entre aspas e duplica as aspas internas
                return `"${stringData.replace(/"/g, '""')}"`;
            }
            return stringData;
        };


        // 2. Mapear os dados para linhas do CSV
        const rows = activeCollaborators.map(collab => [
            escapeCsvCell(collab.first_name),
            escapeCsvCell(collab.last_name),
            escapeCsvCell(collab.email)
        ]);

        // 3. Montar o conteúdo CSV
        let csvContent = '\uFEFF'; // BOM UTF-8
        csvContent += headers.join(';') + '\n';
        rows.forEach(row => {
            csvContent += row.join(';') + '\n';
        });

        // 4. Criar Blob e Link para Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            const fileName = `lista-colaboradores-${new Date().toISOString().split('T')[0]}.csv`; // Nome do arquivo com data
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            setError('Seu navegador não suporta a função de download direto.');
        }
    };
    // *** FIM DA NOVA FUNÇÃO ***

    const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const totalCost = accessReport.reduce((sum, access) => sum + parseFloat(access.price_per_access || 0), 0);

    return (
        <Box sx={{ padding: 3 }}>
            {error && <Typography color="error" gutterBottom>{error}</Typography>}

            {/* Modal para Adicionar Novo Colaborador */}
            <Modal open={isModalOpen} onClose={handleCloseModal}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2">Adicionar Novo Colaborador</Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}><TextField fullWidth name="first_name" label="Primeiro Nome" value={newCollaborator.first_name} onChange={handleFormChange} required /></Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth name="last_name" label="Sobrenome" value={newCollaborator.last_name} onChange={handleFormChange} required /></Grid>
                            <Grid item xs={12}><TextField fullWidth type="email" name="email" label="Email" value={newCollaborator.email} onChange={handleFormChange} required /></Grid>
                            <Grid item xs={12}><TextField fullWidth type="password" name="password" label="Senha" value={newCollaborator.password} onChange={handleFormChange} required /></Grid>
                            <Grid item xs={12} sm={6}><Button type="submit" variant="contained" fullWidth>Adicionar Colaborador</Button></Grid>
                            <Grid item xs={12} sm={6}><Button variant="outlined" fullWidth onClick={handleCloseModal}>Cancelar</Button></Grid>
                        </Grid>
                    </Box>
                </Box>
            </Modal>

            {/* Gerenciamento de Colaboradores */}
            <Paper elevation={3} sx={{ padding: 2, marginBottom: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupIcon color="primary" />
                        <Typography variant="h5">Gerenciamento de Colaboradores</Typography>
                    </Box>
                    {/* Container para os botões de ação */}
                     <Box>
                         {/* *** BOTÃO DE DOWNLOAD ADICIONADO *** */}
                         <Tooltip title="Baixar Lista de Colaboradores (CSV)">
                             {/* Desabilitar se não houver colaboradores ativos */}
                             <span> {/* Span necessário para Tooltip em botão desabilitado */}
                                <IconButton
                                    color="primary"
                                    onClick={handleDownloadCollaborators}
                                    disabled={!collaborators.some(c => c.status === 'active')} // Desabilita se não houver ativos
                                >
                                    <DownloadIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Adicionar Novo Colaborador">
                            <IconButton color="primary" onClick={handleOpenModal}>
                                <AddCircleIcon sx={{ fontSize: 30 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
                <List>
                   {/* Filtra para exibir apenas ativos na lista E mostra mensagem se não houver */}
                   {collaborators.filter(c => c.status === 'active').length > 0 ? (
                       collaborators.map((collaborator, index) => (
                         collaborator.status === 'active' && ( // Redundante, mas seguro
                            <React.Fragment key={collaborator.id}>
                                <ListItem
                                    secondaryAction={
                                        <Tooltip title="Desativar Colaborador">
                                            <IconButton edge="end" aria-label="deactivate" onClick={() => handleDeactivate(collaborator.id)}>
                                                <PersonOffIcon color="error" />
                                            </IconButton>
                                        </Tooltip>
                                    }
                                >
                                    <ListItemText
                                        primary={`${collaborator.first_name} ${collaborator.last_name}`}
                                        secondary={collaborator.email}
                                    />
                                </ListItem>
                                {/* Adiciona Divider apenas se não for o último item *visível* */}
                                {index < collaborators.filter(c => c.status === 'active').length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        )
                    ))
                   ) : (
                    // Mensagem se a lista filtrada estiver vazia
                    <ListItem>
                        <ListItemText primary="Nenhum colaborador ativo encontrado." sx={{ textAlign: 'center', color: 'text.secondary' }}/>
                    </ListItem>
                   )}
                </List>
            </Paper>

            {/* Relatório Detalhado de Acessos */}
            <Paper elevation={3} sx={{ padding: 2 }}>
                <Typography variant="h5" gutterBottom>Relatório Detalhado de Acessos</Typography>
                <Box sx={{ display: 'flex', gap: 2, my: 2, alignItems: 'center' }}>
                    <FormControl size="small">
                        <InputLabel>Mês</InputLabel>
                        <Select name="month" value={selectedDate.month} label="Mês" onChange={handleDateChange}>
                            {Array.from({ length: 12 }, (_, i) => (<MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <FormControl size="small">
                        <InputLabel>Ano</InputLabel>
                        <Select name="year" value={selectedDate.year} label="Ano" onChange={handleDateChange}>
                            {yearOptions.map(year => (<MenuItem key={year} value={year}>{year}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="outlined"
                        onClick={handleDownload}
                        disabled={accessReport.length === 0}
                        startIcon={<DownloadIcon />}
                    >
                        Baixar (CSV)
                    </Button>
                </Box>

                {loading ? <Typography>Carregando relatório...</Typography> : (
                    accessReport.length > 0 ? (
                        <>
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Data e Hora</TableCell>
                                            <TableCell>Colaborador</TableCell>
                                            <TableCell>Academia</TableCell>
                                            <TableCell align="right">Custo</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {accessReport.map(access => (
                                            <tr key={access.id}>
                                                <TableCell>{new Date(access.access_timestamp).toLocaleString('pt-BR')}</TableCell>
                                                <TableCell>{`${access.first_name} ${access.last_name}`}</TableCell>
                                                <TableCell>{access.gym_name}</TableCell>
                                                <TableCell align="right">R$ {parseFloat(access.price_per_access || 0).toFixed(2)}</TableCell>
                                            </tr>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                             <Typography variant="h6" sx={{ mt: 2, textAlign: 'right', fontWeight: 'bold' }}>
                                Custo Total do Mês: R$ {totalCost.toFixed(2)}
                            </Typography>
                        </>
                    ) : (
                       <Typography sx={{ mt: 2 }}>Nenhum acesso registrado pelos colaboradores neste período.</Typography>
                    )
                )}
            </Paper>
        </Box>
    );
};

export default CompanyAdminDashboard;