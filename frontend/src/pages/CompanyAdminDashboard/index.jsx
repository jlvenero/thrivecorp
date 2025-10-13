import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CompanyAdminDashboard.css';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';

const CompanyAdminDashboard = () => {
    const [collaborators, setCollaborators] = useState([]);
    const [accessReport, setAccessReport] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [newCollaborator, setNewCollaborator] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: ''
    });

    const [selectedDate, setSelectedDate] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    });

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
            fetchCollaborators();
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
            console.error(err);
        }
    };

    const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const totalCost = accessReport.reduce((sum, access) => sum + parseFloat(access.price_per_access || 0), 0);
    const filteredCollaborators = collaborators.filter(c =>
        c.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="company-admin-dashboard-container">
            <header className="dashboard-header">
                <GroupIcon className="header-icon" />
                <div>
                    <h2>Gerenciamento de Colaboradores</h2>
                    <p>Gerencie os colaboradores e visualize relatórios de acessos</p>
                </div>
            </header>

            <div className="search-bar-container">
                <SearchIcon className="search-icon" />
                <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="content-section">
                <h3>Adicionar Novo Colaborador</h3>
                <form onSubmit={handleSubmit} className="add-collaborator-form">
                    <div className="form-row">
                        <input type="text" name="first_name" value={newCollaborator.first_name} onChange={handleFormChange} placeholder="Primeiro Nome" required />
                        <input type="text" name="last_name" value={newCollaborator.last_name} onChange={handleFormChange} placeholder="Sobrenome" required />
                    </div>
                    <div className="form-row">
                        <input type="email" name="email" value={newCollaborator.email} onChange={handleFormChange} placeholder="Email" required />
                        <input type="password" name="password" value={newCollaborator.password} onChange={handleFormChange} placeholder="Senha" required />
                    </div>
                    <button type="submit" className="add-btn">Adicionar Colaborador</button>
                </form>
            </div>

<div className="content-section">
    <h3>Lista de Colaboradores Ativos</h3>
    <ul className="collaborators-list">
        {filteredCollaborators.map(collaborator => (
            <li key={collaborator.id}>
                <div className="collaborator-info">
                    <span className="collaborator-name">{collaborator.first_name} {collaborator.last_name}</span>
                    <span className="collaborator-email">{collaborator.email}</span>
                    <span className="collaborator-status">Status: {collaborator.status}</span>
                </div>
                {collaborator.status === 'active' && (
                    <button className="deactivate-btn" onClick={() => handleDeactivate(collaborator.id)}>
                        Desativar
                    </button>
                )}
            </li>
        ))}
    </ul>
</div>

            <div className="content-section">
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
                    <button onClick={handleDownload} disabled={accessReport.length === 0} className="download-btn">
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
        </div>
    );
};

export default CompanyAdminDashboard;