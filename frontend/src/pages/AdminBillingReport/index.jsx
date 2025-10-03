import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminBillingReport.css';

const AdminBillingReport = () => {
    const [report, setReport] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    });

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

    useEffect(() => {
        fetchReport();
    }, [selectedDate]);

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setSelectedDate(prev => ({ ...prev, [name]: parseInt(value) }));
    };

    // Gera opções para os últimos 5 anos
    const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    return (
        <div className="billing-report-container">
            <h3>Extrato Mensal para Faturamento</h3>
            <div className="filters">
                <select name="month" value={selectedDate.month} onChange={handleDateChange}>
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                </select>
                <select name="year" value={selectedDate.year} onChange={handleDateChange}>
                    {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            {loading && <p>Carregando relatório...</p>}
            {error && <p className="error-message">{error}</p>}
            
            {!loading && report.length > 0 ? (
                <table className="billing-table">
                    <thead>
                        <tr>
                            <th>Empresa</th>
                            <th>Total de Acessos</th>
                            <th>Custo Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.map(item => (
                            <tr key={item.company_id}>
                                <td>{item.company_name}</td>
                                <td>{item.total_accesses}</td>
                                <td>R$ {parseFloat(item.total_cost).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                !loading && <p>Nenhum dado de faturamento encontrado para o período selecionado.</p>
            )}
        </div>
    );
};

export default AdminBillingReport;