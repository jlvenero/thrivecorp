// src/pages/CompanyAdminDashboard/index.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CompanyAdminDashboard.css';

const CompanyAdminDashboard = () => {
    const [collaborators, setCollaborators] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [newCollaborator, setNewCollaborator] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: ''
    });

    const fetchCollaborators = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/company/collaborators`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCollaborators(response.data);
        } catch (err) {
            setError('Falha ao buscar os colaboradores. Verifique o backend.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

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
            const response = await axios.post(`http://localhost:3000/api/company/collaborators`, newCollaborator, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            fetchCollaborators();
            setNewCollaborator({ first_name: '', last_name: '', email: '', password: '' });

        } catch (err) {
            setError('Falha ao criar o colaborador.');
            console.error(err);
        }
    };

    // NOVA FUNÇÃO PARA DESATIVAR
    const handleDeactivate = async (collaboratorId) => {
        if (window.confirm("Tem certeza que deseja desativar este colaborador? Ele não poderá mais acessar a plataforma.")) {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`http://localhost:3000/api/company/collaborators/${collaboratorId}/deactivate`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                // Recarrega a lista para mostrar o status atualizado
                fetchCollaborators();
            } catch (err) {
                setError('Falha ao desativar o colaborador.');
                console.error(err);
            }
        }
    };


    useEffect(() => {
        fetchCollaborators();
    }, []);

    if (loading) return <p>Carregando colaboradores...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="company-admin-dashboard-container">
            <h3>Gerenciamento de Colaboradores</h3>

            <form onSubmit={handleSubmit}>
                <h4>Adicionar Novo Colaborador</h4>
                <input
                    type="text"
                    name="first_name"
                    value={newCollaborator.first_name}
                    onChange={handleFormChange}
                    placeholder="Primeiro Nome"
                    required
                />
                <input
                    type="text"
                    name="last_name"
                    value={newCollaborator.last_name}
                    onChange={handleFormChange}
                    placeholder="Sobrenome"
                    required
                />
                <input
                    type="email"
                    name="email"
                    value={newCollaborator.email}
                    onChange={handleFormChange}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    name="password"
                    value={newCollaborator.password}
                    onChange={handleFormChange}
                    placeholder="Senha"
                    required
                />
                <button type="submit">Adicionar Colaborador</button>
            </form>

            <hr />

            <h4>Lista de Colaboradores</h4>
            {collaborators.length > 0 ? (
                <ul>
                    {collaborators.map(collaborator => (
                        <li key={collaborator.id}>
                            <div className="collaborator-info">
                                {collaborator.first_name} {collaborator.last_name} ({collaborator.email}) - Status: {collaborator.status}
                            </div>
                            {/* Mostra o botão apenas se o colaborador estiver ativo */}
                            {collaborator.status === 'active' && (
                                <button
                                    className="deactivate-btn"
                                    onClick={() => handleDeactivate(collaborator.id)}
                                >
                                    Desativar
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Nenhum colaborador encontrado.</p>
            )}
        </div>
    );
};

export default CompanyAdminDashboard;