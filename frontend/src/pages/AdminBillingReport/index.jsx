import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, IconButton, Tooltip, Alert, CircularProgress,
    Select, MenuItem, FormControl, InputLabel, Button
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // Ícone da página
import DownloadIcon from '@mui/icons-material/Download';      // Ícone de Download
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead'; // Ícone para Marcar como Faturado
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread'; // Ícone para Marcar como Pendente
import ConfirmationDialog from '../../components/ConfirmationDialog'; // Reutilizar o diálogo

// Componente StatusChip adaptado para esta tela
const StatusChip = ({ status }) => {
    let colors = { bg: 'default', border: 'default' };
    let label = status;

    if (status === 'pending') {
        colors = { bg: 'warning.light', border: 'warning.main' };
        label = 'Pendente';
    }
    if (status === 'sent') {
        colors = { bg: 'success.light', border: 'success.main' };
        label = 'Faturado'
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
            minWidth: '80px', // Garante largura mínima
             '& .MuiChip-label': { px: '4px' }
        }}
    />;
};

const AdminBillingReport = () => {
    const [report, setReport] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true); // Iniciar como true
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState({ title: '', message: '', onConfirm: () => {} });

    const [selectedDate, setSelectedDate] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    });
    const [selectedCompany, setSelectedCompany] = useState('all');

    // Busca o relatório principal
    const fetchReport = async () => {
        setLoading(true);
        setError(null); // Limpa erro anterior
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/accesses/billing-report`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { year: selectedDate.year, month: selectedDate.month }
            });
            setReport(response.data);
        } catch (err) {
            setError('Falha ao buscar o relatório de faturamento.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Busca a lista de empresas para o filtro
    const fetchCompanies = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/companies', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filtra apenas empresas ativas para o select
            setCompanies(response.data.filter(c => c.status === 'active'));
        } catch (err) {
            console.error("Falha ao buscar empresas para o filtro:", err);
            // Não define erro principal aqui para não atrapalhar o relatório
        }
    };

     // Efeito para buscar dados iniciais
     useEffect(() => {
        fetchCompanies();
        fetchReport();
    }, []); // Executa apenas na montagem inicial

    // Efeito para re-buscar o relatório quando a data muda
    useEffect(() => {
        fetchReport();
    }, [selectedDate]); // Executa quando selectedDate muda


    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setSelectedDate(prev => ({ ...prev, [name]: parseInt(value) }));
    };

    const handleCompanyChange = (e) => {
        setSelectedCompany(e.target.value);
    };

    // Função unificada para atualizar o status
    const handleUpdateStatus = async (companyId, newStatus) => {
        setDialogOpen(false); // Fecha o diálogo
        setError(null); // Limpa erro anterior
        try {
            const token = localStorage.getItem('token');
            // Chama a nova rota do backend
            await axios.post('http://localhost:3000/api/admin/billing/status', {
                companyId,
                year: selectedDate.year,
                month: selectedDate.month,
                status: newStatus // Envia o status desejado
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchReport(); // Atualiza a lista para mostrar o novo status
        } catch (err) {
            setError(err.response?.data?.error || 'Falha ao atualizar o status.');
        }
    };

    // Função para abrir o diálogo de confirmação
    const openConfirmationDialog = (companyId, currentStatus) => {
        const isCurrentlySent = currentStatus === 'sent';
        const newStatus = isCurrentlySent ? 'pending' : 'sent';
        const actionText = isCurrentlySent ? 'desmarcar como faturado' : 'marcar como faturado';
        const titleText = isCurrentlySent ? 'Confirmar Pendência' : 'Confirmar Faturamento';

        setDialogConfig({
            title: titleText,
            message: `Tem certeza que deseja ${actionText} para esta empresa no período selecionado?`,
            onConfirm: () => handleUpdateStatus(companyId, newStatus) // Passa o novo status
        });
        setDialogOpen(true);
    };


    const handleDownload = () => {
        setError(null); // Limpa erro anterior

        if (!filteredReport || filteredReport.length === 0) {
            setError('Não há dados filtrados para exportar.');
            return;
        }

        // --- Início da Lógica de Geração de CSV no Frontend ---

        // 1. Definir Cabeçalhos (com acentos)
        const headers = [
            'Empresa',
            'Total de Acessos',
            'Custo Total',
            'Status da Fatura'
        ];

        // 2. Mapear os dados filtrados para linhas do CSV
        const rows = filteredReport.map(item => [
            `"${item.company_name.replace(/"/g, '""')}"`, // Trata aspas dentro do nome
            item.total_accesses,
            // Formatar número para padrão CSV (ponto como decimal, sem R$)
            parseFloat(item.total_cost || 0).toFixed(2).replace('.', ','), // Troca ponto por vírgula para Excel PT-BR
            item.billing_status === 'sent' ? 'Faturado' : 'Pendente'
        ]);

        // 3. Montar o conteúdo CSV (Cabeçalhos + Linhas)
        // Adiciona o BOM (Byte Order Mark) para UTF-8, melhorando compatibilidade com Excel
        let csvContent = '\uFEFF';
        csvContent += headers.join(';') + '\n'; // Usar ponto e vírgula como separador
        rows.forEach(row => {
            csvContent += row.join(';') + '\n';
        });

        // 4. Criar Blob e Link para Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) { // Checa se o browser suporta download
            const url = URL.createObjectURL(blob);
            // Nome do arquivo dinâmico com filtros
            const companyName = selectedCompany === 'all' ? 'todas' : companies.find(c => c.id === parseInt(selectedCompany))?.name || 'desconhecida';
            const fileName = `relatorio-faturamento-${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;

            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url); // Libera memória
        } else {
             setError('Seu navegador não suporta a função de download direto.');
        }
        // --- Fim da Lógica de Geração de CSV no Frontend ---
    };

    const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const monthOptions = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}`.padStart(2, '0') })); // Meses 01-12

    // Filtra o relatório localmente APÓS buscar todos os dados
    const filteredReport = report.filter(item =>
        selectedCompany === 'all' || item.company_id === parseInt(selectedCompany)
    );

    // Calcula totais apenas do relatório filtrado
    const totalAccessesFiltered = filteredReport.reduce((sum, item) => sum + item.total_accesses, 0);
    const totalCostFiltered = filteredReport.reduce((sum, item) => sum + parseFloat(item.total_cost || 0), 0);

    return (
        <>
            {/* Título da Página */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <ReceiptLongIcon sx={{ color: 'primary.main', fontSize: '2.5rem' }} />
                <Typography variant="h5">Extrato Mensal para Faturamento</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Visualize os custos consolidados por empresa e gerencie o status do faturamento.
            </Typography>

            {/* Alerta de Erro */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Card Principal */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: '12px' }}>
                {/* Filtros e Botão de Download */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Mês</InputLabel>
                        <Select name="month" value={selectedDate.month} label="Mês" onChange={handleDateChange}>
                            {monthOptions.map(month => (
                                <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                        <InputLabel>Ano</InputLabel>
                        <Select name="year" value={selectedDate.year} label="Ano" onChange={handleDateChange}>
                            {yearOptions.map(year => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 200, flexGrow: 1 }}>
                        <InputLabel>Empresa</InputLabel>
                        <Select value={selectedCompany} label="Empresa" onChange={handleCompanyChange}>
                            <MenuItem value="all">Todas as Empresas</MenuItem>
                            {companies.map(company => (
                                <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="outlined"
                        onClick={handleDownload}
                        startIcon={<DownloadIcon />}
                        disabled={loading || filteredReport.length === 0} // Desabilita se carregando ou sem dados filtrados
                        sx={{ height: '40px' }} // Alinha altura com os Selects
                    >
                        Exportar CSV
                    </Button>
                </Box>

                {/* Tabela de Dados */}
                <TableContainer>
                    <Table sx={{ '& .MuiTableCell-root': { borderBottom: 'none' } }}>
                        <TableHead>
                            <TableRow sx={{ '& .MuiTableCell-head': { color: 'text.secondary', fontWeight: '600' } }}>
                                <TableCell>Empresa</TableCell>
                                <TableCell align="right">Total de Acessos</TableCell>
                                <TableCell align="right">Custo Total</TableCell>
                                <TableCell align="center">Status da Fatura</TableCell>
                                <TableCell align="right">Ação</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow>
                            ) : filteredReport.length === 0 ? (
                                 <TableRow><TableCell colSpan={5} align="center">Nenhum dado encontrado para os filtros selecionados.</TableCell></TableRow>
                            ) : (
                                filteredReport.map(item => (
                                    <TableRow key={item.company_id} hover sx={{ '& > *': { borderBottom: '1px solid #e2e8f0' } }}>
                                        <TableCell sx={{ fontWeight: '600', color: 'text.primary' }}>{item.company_name}</TableCell>
                                        <TableCell align="right">{item.total_accesses}</TableCell>
                                        <TableCell align="right">R$ {parseFloat(item.total_cost || 0).toFixed(2)}</TableCell>
                                        <TableCell align="center"><StatusChip status={item.billing_status} /></TableCell>
                                        <TableCell align="right">
                                            <Tooltip title={item.billing_status === 'sent' ? 'Marcar como Pendente' : 'Marcar como Faturado'}>
                                                {/* IconButton chama a função para abrir o diálogo */}
                                                <IconButton onClick={() => openConfirmationDialog(item.company_id, item.billing_status)}
                                                    color={item.billing_status === 'sent' ? 'warning' : 'success'} // Cor muda com o estado
                                                >
                                                    {item.billing_status === 'sent' ? <MarkChatUnreadIcon /> : <MarkChatReadIcon />}
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                            {/* Linha de Totais (apenas se houver dados e não estiver carregando) */}
                            {!loading && filteredReport.length > 0 && (
                                <TableRow sx={{ backgroundColor: '#f8fafc', '& > *': { fontWeight: 'bold' } }}>
                                     <TableCell>TOTAL ({filteredReport.length} {filteredReport.length === 1 ? 'empresa' : 'empresas'})</TableCell>
                                    <TableCell align="right">{totalAccessesFiltered}</TableCell>
                                    <TableCell align="right">R$ {totalCostFiltered.toFixed(2)}</TableCell>
                                    <TableCell colSpan={2}></TableCell> {/* Células vazias para alinhar */}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
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

export default AdminBillingReport;