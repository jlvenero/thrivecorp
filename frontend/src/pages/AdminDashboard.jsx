import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../apiConfig'

const AdminDashboard = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCompanies = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/companies/api/companies`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCompanies(response.data);
        } catch (err) {
            setError('Falha ao buscar as empresas. Verifique sua conexão.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Função para aprovar uma empresa
    const handleApprove = async (companyId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/companies/${companyId}/approve`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Após a aprovação, atualiza a lista de empresas
            fetchCompanies();
        } catch (err) {
            setError('Falha ao aprovar a empresa.');
            console.error(err);
        }
    };

    // O useEffect é chamado uma vez quando o componente é montado
    useEffect(() => {
        fetchCompanies();
    }, []);

    if (loading) return <p>Carregando empresas...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Painel Administrativo - Empresas</h2>
            <p>Empresas Cadastradas:</p>
            <ul>
                {companies.length > 0 ? (
                    companies.map(company => (
                        <li key={company.id}>
                            {company.name} (CNPJ: {company.cnpj}) - Status: {company.status}
                            {company.status === 'pending' && (
                                <button onClick={() => handleApprove(company.id)}>
                                    Aprovar
                                </button>
                            )}
                        </li>
                    ))
                ) : (
                    <p>Nenhuma empresa encontrada.</p>
                )}
            </ul>
        </div>
    );
};

export default AdminDashboard;