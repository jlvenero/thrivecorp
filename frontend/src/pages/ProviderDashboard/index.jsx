import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProviderDashboard.css';

const ProviderDashboard = () => {
    // Estados para os dados
    const [gyms, setGyms] = useState([]);
    const [accessReport, setAccessReport] = useState([]);
    const [plans, setPlans] = useState([]);
    
    // Estados de controle
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Estados para os formulários
    const [newGym, setNewGym] = useState({ name: '', address: '' });
    const [newPlan, setNewPlan] = useState({ name: '', description: '', price_per_access: '' });

    // Função para buscar todos os dados da página
    const fetchAllData = async () => {
        setLoading(true);
        setError(''); // Limpa erros anteriores
        
        try {
            const token = localStorage.getItem('token');
            const headers = { headers: { Authorization: `Bearer ${token}` } };

            // Usamos Promise.allSettled para que uma falha não impeça as outras de funcionarem
            const results = await Promise.allSettled([
                axios.get('http://localhost:3000/api/gyms', headers),
                axios.get('http://localhost:3000/api/accesses/provider-report', headers),
                axios.get('http://localhost:3000/api/plans', headers)
            ]);

            // Verificamos o resultado de cada requisição individualmente
            if (results[0].status === 'fulfilled') setGyms(results[0].value.data);
            if (results[1].status === 'fulfilled') setAccessReport(results[1].value.data);
            if (results[2].status === 'fulfilled') setPlans(results[2].value.data);
            
            // Se alguma requisição falhou, mostramos um erro genérico
            if (results.some(res => res.status === 'rejected')) {
                setError('Falha ao carregar parte dos dados. Verifique o console do backend.');
            }

        } catch (err) {
            setError('Ocorreu um erro inesperado.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Funções de formulário (handlers)
    const handlePlanFormChange = (e) => setNewPlan({ ...newPlan, [e.target.name]: e.target.value });
    const handleGymFormChange = (e) => setNewGym({ ...newGym, [e.target.name]: e.target.value });

    const handlePlanSubmit = async (e) => {
        e.preventDefault();
        // ... (lógica para enviar o novo plano e depois chamar fetchAllData)
    };
    
    const handleGymSubmit = async (e) => {
        e.preventDefault();
        // ... (lógica para enviar a nova academia e depois chamar fetchAllData)
    };

    return (
        <div className="provider-dashboard-container">
            {error && <p className="error-message">{error}</p>}

            {/* Seção de Planos */}
            <div className="section-container">
                <h3>Gerenciar Planos</h3>
                {/* O formulário de planos aqui */}
                <h4>Meus Planos Cadastrados</h4>
                {loading ? <p>Carregando...</p> : (
                    plans.length > 0 ? (
                        <ul className="plans-list">
                            {plans.map(plan => (
                                <li key={plan.id}>
                                    <div className="plan-info">
                                        <span className="plan-name">{plan.name}</span>
                                        <span className="plan-description">{plan.description}</span>
                                    </div>
                                    <span className="plan-price">R$ {parseFloat(plan.price_per_access).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p>Nenhum plano cadastrado ainda.</p>
                )}
            </div>
            <hr />

            {/* Seção de Academias */}
            <div className="section-container">
                <h3>Gerenciar Academias</h3>
                 {/* O formulário de academias aqui */}
                <h4>Minhas Academias</h4>
                {loading ? <p>Carregando...</p> : (
                    gyms.length > 0 ? (
                        <ul>
                            {gyms.map(gym => (
                                <li key={gym.id}>
                                    <span className="gym-name">{gym.name}</span>
                                    <span className="gym-address">{gym.address}</span>
                                    <span className={`gym-status ${gym.status}`}>
                                        {gym.status.charAt(0).toUpperCase() + gym.status.slice(1)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : <p>Nenhuma academia cadastrada.</p>
                )}
            </div>
            <hr />
            
            {/* Seção do Relatório */}
            <div className="section-container">
                <h3>Relatório de Check-ins</h3>
                {loading ? <p>Carregando...</p> : (
                    accessReport.length > 0 ? (
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
                    ) : <p>Nenhum check-in registrado ainda.</p>
                )}
            </div>
        </div>
    );
};

export default ProviderDashboard;