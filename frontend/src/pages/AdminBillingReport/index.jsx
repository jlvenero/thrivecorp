import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminBillingReport.css';

const AdminBillingReport = () => {
    const [report, setReport] = useState([]);
    const [companies, setCompanies] = useState([]); // Para popular o filtro de empresas
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Estados para os filtros
    const [selectedDate, setSelectedDate] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    });
    const [selectedCompany, setSelectedCompany] = useState('all'); // 'all' para todas as empresas

    // Busca o relatório principal
    const fetchReport = async () => {
        setLoading(true);
        setError('');
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
            setCompanies(response.data);
        } catch (err) {
            console.error("Falha ao buscar empresas para o filtro:", err);
        }
    };

    useEffect(() => {
        fetchCompanies(); // Busca empresas uma vez ao carregar
        fetchReport(); // Busca o relatório inicial
    }, []);

    // Re-busca o relatório quando a data muda
    useEffect(() => {
        fetchReport();
    }, [selectedDate]);

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setSelectedDate(prev => ({ ...prev, [name]: parseInt(value) }));
    };

    const handleCompanyChange = (e) => {
        setSelectedCompany(e.target.value);
    };

    const handleMarkAsSent = async (companyId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3000/api/admin/billing/mark-sent', {
                companyId,
                year: selectedDate.year,
                month: selectedDate.month
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchReport(); // Atualiza a lista para mostrar o novo status
        } catch (err) {
            setError('Falha ao atualizar o status.');
        }
    };

    const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    
    // Lógica para filtrar o relatório exibido
    const filteredReport = report.filter(item => 
        selectedCompany === 'all' || item.company_id === parseInt(selectedCompany)
    );

    return (
        <div className="billing-report-container">
            <h3>Extrato Mensal para Faturamento</h3>
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
                <label>Empresa:</label>
                <select value={selectedCompany} onChange={handleCompanyChange}>
                    <option value="all">Todas as Empresas</option>
                    {companies.map(company => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                </select>
            </div>
            
            {loading && <p>Carregando relatório...</p>}
            {error && <p className="error-message">{error}</p>}
            
            {!loading && filteredReport.length > 0 ? (
                <table className="billing-table">
                    <thead>
                        <tr>
                            <th>Empresa</th>
                            <th>Total de Acessos</th>
                            <th>Custo Total</th>
                            <th>Status da Fatura</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReport.map(item => (
                            <tr key={item.company_id}>
                                <td>{item.company_name}</td>
                                <td>{item.total_accesses}</td>
                                <td>R$ {parseFloat(item.total_cost || 0).toFixed(2)}</td>
                                <td>
                                    <span className={`status ${item.billing_status}`}>
                                        {item.billing_status === 'sent' ? 'Faturado' : 'Pendente'}
                                    </span>
                                </td>
                                <td>
                                    {item.billing_status !== 'sent' && (
                                        <button 
                                            className="action-btn"
                                            onClick={() => handleMarkAsSent(item.company_id)}
                                        >
                                            Marcar como Faturado
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                !loading && <p>Nenhum dado de faturamento encontrado para os filtros selecionados.</p>
            )}
        </div>
    );
};

export default AdminBillingReport;