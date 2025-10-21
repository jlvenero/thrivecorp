import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProviderDashboard.css';

const ProviderDashboard = () => {
    // Estados para os dados
    const [gyms, setGyms] = useState([]);
    const [accessReport, setAccessReport] = useState([]);
    const [plans, setPlans] = useState([]);
    
    // Estados de controle da UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditingPlan, setIsEditingPlan] = useState(false);
    const [isEditingGym, setIsEditingGym] = useState(false);
    
    // Estados para os formulários
    const [planForm, setPlanForm] = useState({ id: null, name: '', description: '', price_per_access: '' });
    const [gymForm, setGymForm] = useState({ id: null, name: '', address: '' });

    // Função para buscar todos os dados da página
    const fetchAllData = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const headers = { headers: { Authorization: `Bearer ${token}` } };

            const [gymsRes, reportRes, plansRes] = await Promise.all([
                axios.get('http://localhost:3000/api/gyms', headers),
                axios.get('http://localhost:3000/api/accesses/provider-report', headers),
                axios.get('http://localhost:3000/api/plans', headers)
            ]);

            setGyms(gymsRes.data);
            setAccessReport(reportRes.data);
            setPlans(plansRes.data);
        } catch (err) {
            setError('Falha ao carregar os dados. Tente atualizar a página.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // --- LÓGICA DE GERENCIAMENTO DE PLANOS ---
    const handlePlanFormChange = (e) => setPlanForm({ ...planForm, [e.target.name]: e.target.value });
    const resetPlanForm = () => {
        setIsEditingPlan(false);
        setPlanForm({ id: null, name: '', description: '', price_per_access: '' });
    };
    const handlePlanSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const headers = { headers: { Authorization: `Bearer ${token}` } };
        try {
            if (isEditingPlan) {
                await axios.put(`http://localhost:3000/api/plans/${planForm.id}`, planForm, headers);
            } else {
                await axios.post('http://localhost:3000/api/plans', planForm, headers);
            }
            resetPlanForm();
            fetchAllData();
        } catch (err) { setError('Falha ao salvar o plano.'); }
    };
    const handleEditPlanClick = (plan) => {
        setIsEditingPlan(true);
        setPlanForm(plan);
    };
    const handleDeletePlanClick = async (planId) => {
        if (window.confirm("Tem certeza que deseja deletar este plano?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:3000/api/plans/${planId}`, { headers: { Authorization: `Bearer ${token}` } });
                fetchAllData();
            } catch (err) {
                setError('Falha ao deletar o plano.');
            }
        }
    };
    
    // --- LÓGICA DE GERENCIAMENTO DE ACADEMIAS ---
    const handleGymFormChange = (e) => setGymForm({ ...gymForm, [e.target.name]: e.target.value });
    const resetGymForm = () => {
        setIsEditingGym(false);
        setGymForm({ id: null, name: '', address: '' });
    };
    const handleGymSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const headers = { headers: { Authorization: `Bearer ${token}` } };
        try {
            if (isEditingGym) {
                await axios.put(`http://localhost:3000/api/gyms/${gymForm.id}`, gymForm, headers);
            } else {
                await axios.post('http://localhost:3000/api/provider/gyms', gymForm, headers);
            }
            resetGymForm();
            fetchAllData();
        } catch (err) { setError('Falha ao salvar a academia.'); }
    };
    const handleEditGymClick = (gym) => {
        setIsEditingGym(true);
        setGymForm(gym);
    };
    const handleDeleteGymClick = async (gymId) => {
        if (window.confirm("Tem certeza que deseja deletar esta academia?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:3000/api/gyms/${gymId}`, { headers: { Authorization: `Bearer ${token}` } });
                fetchAllData();
            } catch (err) {
                setError('Falha ao deletar a academia.');
            }
        }
    };

    return (
        <div className="provider-dashboard-container">
            {error && <p className="error-message">{error}</p>}

            {/* Seção de Gerenciamento de Academias */}
            <div className="section-container">
                <h3>Gerenciar Academias</h3>
                <form onSubmit={handleGymSubmit} className="form-container">
                    <h4>{isEditingGym ? 'Editar Academia' : 'Adicionar Nova Academia'}</h4>
                    <input type="text" name="name" value={gymForm.name} onChange={handleGymFormChange} placeholder="Nome da Academia" required />
                    <input type="text" name="address" value={gymForm.address} onChange={handleGymFormChange} placeholder="Endereço Completo" required />
                    <button type="submit">{isEditingGym ? 'Salvar Alterações' : 'Adicionar Academia'}</button>
                    {isEditingGym && <button type="button" onClick={resetGymForm} style={{ marginLeft: '10px', backgroundColor: '#6c757d' }}>Cancelar Edição</button>}
                </form>

                <h4>Minhas Academias</h4>
                {loading ? <p>Carregando academias...</p> : (
                    gyms.length > 0 ? (
                        <ul className="gym-list">
                            {gyms.map(gym => (
                                <li key={gym.id}>
                                    <div className="gym-info">
                                        <span className="gym-name">{gym.name}</span>
                                        <span className="gym-address">{gym.address}</span>
                                    </div>
                                    <span className={`gym-status ${gym.status}`}>
                                        {gym.status.charAt(0).toUpperCase() + gym.status.slice(1)}
                                    </span>
                                    <div className="gym-actions">
                                        <button onClick={() => handleEditGymClick(gym)}>Editar</button>
                                        <button onClick={() => handleDeleteGymClick(gym.id)} className="delete-btn">Deletar</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p>Nenhuma academia cadastrada.</p>
                )}
            </div>
            <hr />

            {/* Seção de Gerenciamento de Planos */}
            <div className="section-container">
                <h3>Gerenciar Planos</h3>
                <form onSubmit={handlePlanSubmit} className="form-container">
                    <h4>{isEditingPlan ? 'Editar Plano' : 'Adicionar Novo Plano'}</h4>
                    <input type="text" name="name" value={planForm.name} onChange={handlePlanFormChange} placeholder="Nome do Plano (Ex: Plano Diário)" required />
                    <textarea name="description" value={planForm.description} onChange={handlePlanFormChange} placeholder="Descrição do Plano" required />
                    <input type="number" step="0.01" name="price_per_access" value={planForm.price_per_access} onChange={handlePlanFormChange} placeholder="Preço por Acesso (Ex: 35.50)" required />
                    <button type="submit">{isEditingPlan ? 'Salvar Alterações' : 'Adicionar Plano'}</button>
                    {isEditingPlan && (
                        <button type="button" onClick={resetPlanForm} style={{ marginLeft: '10px', backgroundColor: '#6c757d' }}>
                            Cancelar Edição
                        </button>
                    )}
                </form>

                <h4>Meus Planos Cadastrados</h4>
                {loading ? <p>Carregando planos...</p> : (
                    plans.length > 0 ? (
                        <ul className="plans-list">
                            {plans.map(plan => (
                                <li key={plan.id}>
                                    <div className="plan-info">
                                        <span className="plan-name">{plan.name}</span>
                                        <span className="plan-description">{plan.description}</span>
                                    </div>
                                    <span className="plan-price">R$ {parseFloat(plan.price_per_access).toFixed(2)}</span>
                                    <div className="plan-actions">
                                        <button onClick={() => handleEditPlanClick(plan)}>Editar</button>
                                        <button onClick={() => handleDeletePlanClick(plan.id)} className="delete-btn">Deletar</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p>Nenhum plano cadastrado ainda.</p>
                )}
            </div>
            <hr />
            
            {/* Seção do Relatório de Check-ins */}
            <div className="section-container">
                <h3>Relatório de Check-ins</h3>
                {loading ? <p>Carregando relatório...</p> : (
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