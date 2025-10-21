import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CompanyAdminDashboard.css';

const CompanyAdminDashboard = () => {
    // Estados para os dados
    const [collaborators, setCollaborators] = useState([]);
    const [accessReport, setAccessReport] = useState([]);

    // Estados de controle da interface
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    // Função para buscar a lista de colaboradores
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

    // Função para buscar o relatório de acessos com base na data selecionada
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

    // Efeito para buscar dados: colaboradores (uma vez) e relatório (quando a data muda)
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
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:3000/api/company/collaborators`, newCollaborator, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewCollaborator({ first_name: '', last_name: '', email: '', password: '' });
            fetchCollaborators(); // Atualiza apenas a lista de colaboradores
        } catch (err) {
            setError('Falha ao criar o colaborador.');
        }
    };

    const handleDeactivate = async (collaboratorId) => {
        if (window.confirm("Tem certeza que deseja desativar este colaborador?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`http://localhost:3000/api/company/collaborators/${collaboratorId}/deactivate`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchCollaborators(); // Atualiza apenas a lista de colaboradores
            } catch (err) {
                setError('Falha ao desativar o colaborador.');
            }
        }
    };

    // Nova função para o download
    const handleDownload = async () => {
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/accesses/download-company-report`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { year: selectedDate.year, month: selectedDate.month },
                responseType: 'blob', // Essencial para o download
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
            console.error(err);
        }
    };

    const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const totalCost = accessReport.reduce((sum, access) => sum + parseFloat(access.price_per_access || 0), 0);

    return (
        <div className="company-admin-dashboard-container">
            {error && <p className="error-message">{error}</p>}

            <h3>Gerenciamento de Colaboradores</h3>
            <form onSubmit={handleSubmit}>
                <h4>Adicionar Novo Colaborador</h4>
                <input type="text" name="first_name" value={newCollaborator.first_name} onChange={handleFormChange} placeholder="Primeiro Nome" required />
                <input type="text" name="last_name" value={newCollaborator.last_name} onChange={handleFormChange} placeholder="Sobrenome" required />
                <input type="email" name="email" value={newCollaborator.email} onChange={handleFormChange} placeholder="Email" required />
                <input type="password" name="password" value={newCollaborator.password} onChange={handleFormChange} placeholder="Senha" required />
                <button type="submit">Adicionar Colaborador</button>
            </form>
            <hr />

            <h4>Lista de Colaboradores Ativos</h4>
            <ul>
                {collaborators.map(collaborator => (
                    <li key={collaborator.id}>
                        <div className="collaborator-info">
                            {collaborator.first_name} {collaborator.last_name} ({collaborator.email}) - Status: {collaborator.status}
                        </div>
                        {collaborator.status === 'active' && (
                            <button className="deactivate-btn" onClick={() => handleDeactivate(collaborator.id)}>
                                Desativar
                            </button>
                        )}
                    </li>
                ))}
            </ul>
            <hr />

            <h3>Relatório Detalhado de Acessos</h3>
            <div className="filters">
                <label>Mês:</label>
                <select name="month" value={selectedDate.month} onChange={handleDateChange}>
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                </select>
                <label>Ano:</label>
                <select name="year" value={selectedDate.year} onChange={handleDateChange}>
                    {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
                <button onClick={handleDownload} disabled={accessReport.length === 0} style={{ marginLeft: '10px' }}>
                    Baixar Relatório (CSV)
                </button>
            </div>
            
            {loading && <p>Carregando relatório...</p>}
            
            {!loading && accessReport.length > 0 ? (
                <>
                    <table className="access-table">
                        <thead>
                            <tr>
                                <th>Data e Hora</th>
                                <th>Colaborador</th>
                                <th>Academia</th>
                                <th>Custo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accessReport.map(access => (
                                <tr key={access.id}>
                                    <td>{new Date(access.access_timestamp).toLocaleString('pt-BR')}</td>
                                    <td>{`${access.first_name} ${access.last_name}`}</td>
                                    <td>{access.gym_name}</td>
                                    <td>R$ {parseFloat(access.price_per_access || 0).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="total-cost">
                        <strong>Custo Total do Mês: R$ {totalCost.toFixed(2)}</strong>
                    </div>
                </>
            ) : (
                !loading && <p>Nenhum acesso registrado pelos colaboradores neste período.</p>
            )}
        </div>
    );
};

export default CompanyAdminDashboard;