import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminAprovarEmpresas.css';

const AdminAprovarEmpresas = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCompanies = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/companies', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCompanies(response.data);
        } catch (err) {
            setError('Falha ao buscar as empresas.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (companyId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3000/api/companies/${companyId}/approve`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchCompanies();
        } catch (err) {
            setError('Falha ao aprovar a empresa.');
            console.error(err);
        }
    };

    const handleReject = async (companyId) => {
        if (window.confirm("Tem certeza que deseja reprovar esta empresa? Esta ação não pode ser desfeita.")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:3000/api/companies/${companyId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                fetchCompanies();
            } catch (err) {
                setError('Falha ao reprovar a empresa.');
                console.error(err);
            }
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    if (loading) return <p>Carregando empresas...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="admin-aprovar-empresas-container">
            <h3>Aprovação de Empresas</h3>
            {companies.length > 0 ? (
                <ul>
                    {companies.map(company => (
                        <li key={company.id}>
                            {company.name} (CNPJ: {company.cnpj}) - Status: **{company.status}**
                            {company.status === 'pending' && (
                                <>
                                    <button onClick={() => handleApprove(company.id)}>
                                        Aprovar
                                    </button>
                                    <button onClick={() => handleReject(company.id)}>
                                        Reprovar
                                    </button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Nenhuma empresa encontrada.</p>
            )}
        </div>
    );
};

export default AdminAprovarEmpresas;