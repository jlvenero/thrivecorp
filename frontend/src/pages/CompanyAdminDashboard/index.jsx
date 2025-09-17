import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CompanyAdminDashboard.css';

const CompanyAdminDashboard = () => {
    const [collaborators, setCollaborators] = useState([]);
    const [accessReport, setAccessReport] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newCollaborator, setNewCollaborator] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: ''
    });

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = { headers: { Authorization: `Bearer ${token}` } };
            
            // Busca a lista de colaboradores
            const collaboratorsResponse = await axios.get('http://localhost:3000/api/company/collaborators', headers);
            setCollaborators(collaboratorsResponse.data);

            // Busca o relatório de acessos da empresa
            const reportResponse = await axios.get('http://localhost:3000/api/accesses/company-report', headers);
            setAccessReport(reportResponse.data);

        } catch (err) {
            setError('Falha ao buscar os dados da empresa.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleFormChange = (e) => {
        setNewCollaborator({
            ...newCollaborator,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:3000/api/company/collaborators`, newCollaborator, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewCollaborator({ first_name: '', last_name: '', email: '', password: '' });
            fetchAllData(); // Atualiza todos os dados
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
                fetchAllData(); // Atualiza todos os dados
            } catch (err) {
                setError('Falha ao desativar o colaborador.');
            }
        }
    };

    return (
        <div className="company-admin-dashboard-container">
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

            <h3>Relatório Consolidado de Acessos</h3>
            {error && <p className="error-message">{error}</p>}
            {loading && <p>Carregando...</p>}
            {accessReport.length > 0 ? (
                <table className="access-table">
                    <thead>
                        <tr>
                            <th>Data e Hora</th>
                            <th>Colaborador</th>
                            <th>Academia</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accessReport.map(access => (
                            <tr key={access.id}>
                                <td>{new Date(access.access_timestamp).toLocaleString('pt-BR')}</td>
                                <td>{`${access.first_name} ${access.last_name}`}</td>
                                <td>{access.gym_name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                !loading && <p>Nenhum acesso registrado pelos colaboradores ainda.</p>
            )}
        </div>
    );
};

export default CompanyAdminDashboard;