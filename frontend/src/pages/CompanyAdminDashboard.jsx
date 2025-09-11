import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CompanyAdminDashboard = () => {
    const [collaborators, setCollaborators] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCollaborators = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('userRole');
            const companyId = 3;
            
            const response = await axios.get(`http://localhost:3000/api/company/${companyId}/collaborators`, {
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

    useEffect(() => {
        fetchCollaborators();
    }, []);

    if (loading) return <p>Carregando colaboradores...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h3>Gerenciamento de Colaboradores</h3>
            {collaborators.length > 0 ? (
                <ul>
                    {collaborators.map(collaborator => (
                        <li key={collaborator.id}>
                            {collaborator.first_name} {collaborator.last_name} ({collaborator.email}) - Status: {collaborator.status}
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