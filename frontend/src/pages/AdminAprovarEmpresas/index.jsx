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

    useEffect(() => {
        fetchCompanies();
    }, []);

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

    // A função de reprovar já deleta a empresa pendente
    const handleReject = async (companyId) => {
        if (window.confirm("Tem certeza que deseja reprovar esta empresa? A solicitação será removida.")) {
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

    // NOVA FUNÇÃO PARA DELETAR EMPRESAS ATIVAS
    const handleDelete = async (companyId) => {
        if (window.confirm("ATENÇÃO: Tem certeza que deseja excluir permanentemente esta empresa? Esta ação desativará o administrador associado e não pode ser desfeita.")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:3000/api/companies/${companyId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                fetchCompanies(); // Atualiza a lista após a exclusão
            } catch (err) {
                setError('Falha ao excluir a empresa.');
                console.error(err);
            }
        }
    };


    if (loading) return <p>Carregando empresas...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="admin-aprovar-empresas-container">
            <h3>Gerenciamento de Empresas</h3>
            {error && <p className="error-message">{error}</p>}
            {companies.length > 0 ? (
                <ul>
                    {companies.map(company => (
                        <li key={company.id}>
                            <span>
                                {company.name} (CNPJ: {company.cnpj}) - <span className={`status ${company.status}`}>Status: {company.status}</span>
                            </span>
                            <div className="actions">
                                {company.status === 'pending' && (
                                    <>
                                        <button className="approve-btn" onClick={() => handleApprove(company.id)}>
                                            Aprovar
                                        </button>
                                        <button className="reprove-btn" onClick={() => handleReject(company.id)}>
                                            Reprovar
                                        </button>
                                    </>
                                )}
                                {company.status === 'active' && (
                                    <button className="delete-btn" onClick={() => handleDelete(company.id)}>
                                        Excluir
                                    </button>
                                )}
                            </div>
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