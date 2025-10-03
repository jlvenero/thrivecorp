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
    const [isEditing, setIsEditing] = useState(false);
    
    // Estado unificado para o formulário de planos (criação/edição)
    const [planForm, setPlanForm] = useState({
        id: null,
        name: '',
        description: '',
        price_per_access: ''
    });

    // Função para buscar todos os dados da página
    const fetchAllData = async () => {
        setLoading(true);
        setError('');
        
        try {
            const token = localStorage.getItem('token');
            const headers = { headers: { Authorization: `Bearer ${token}` } };

            // Usando Promise.all para buscar dados em paralelo
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

    const handlePlanFormChange = (e) => {
        const { name, value } = e.target;
        setPlanForm(prev => ({ ...prev, [name]: value }));
    };

    const resetPlanForm = () => {
        setIsEditing(false);
        setPlanForm({ id: null, name: '', description: '', price_per_access: '' });
    };

    const handlePlanSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const token = localStorage.getItem('token');
        const headers = { headers: { Authorization: `Bearer ${token}` } };
        
        try {
            if (isEditing) {
                // Atualiza o plano existente
                await axios.put(`http://localhost:3000/api/plans/${planForm.id}`, planForm, headers);
            } else {
                // Cria um novo plano
                await axios.post('http://localhost:3000/api/plans', planForm, headers);
            }
            resetPlanForm();
            fetchAllData(); // Atualiza a lista de planos
        } catch (err) {
            setError('Falha ao salvar o plano. Verifique os dados e tente novamente.');
            console.error(err);
        }
    };

    const handleEditClick = (plan) => {
        setIsEditing(true);
        setPlanForm({
            id: plan.id,
            name: plan.name,
            description: plan.description,
            price_per_access: plan.price_per_access
        });
    };

    const handleDeleteClick = async (planId) => {
        if (window.confirm("Tem certeza que deseja deletar este plano? Esta ação não pode ser desfeita.")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:3000/api/plans/${planId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchAllData(); // Atualiza a lista de planos
            } catch (err) {
                setError('Falha ao deletar o plano.');
                console.error(err);
            }
        }
    };

    return (
        <div className="provider-dashboard-container">
            {error && <p className="error-message">{error}</p>}

            {/* Seção de Gerenciamento de Planos */}
            <div className="section-container">
                <h3>Gerenciar Planos</h3>
                <form onSubmit={handlePlanSubmit} className="form-container">
                    <h4>{isEditing ? 'Editar Plano' : 'Adicionar Novo Plano'}</h4>
                    <input type="text" name="name" value={planForm.name} onChange={handlePlanFormChange} placeholder="Nome do Plano (Ex: Plano Diário)" required />
                    <textarea name="description" value={planForm.description} onChange={handlePlanFormChange} placeholder="Descrição do Plano" required />
                    <input type="number" step="0.01" name="price_per_access" value={planForm.price_per_access} onChange={handlePlanFormChange} placeholder="Preço por Acesso (Ex: 35.50)" required />
                    <button type="submit">{isEditing ? 'Salvar Alterações' : 'Adicionar Plano'}</button>
                    {isEditing && (
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
                                        <button onClick={() => handleEditClick(plan)}>Editar</button>
                                        <button onClick={() => handleDeleteClick(plan.id)} className="delete-btn">Deletar</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p>Nenhum plano cadastrado ainda.</p>
                )}
            </div>
            <hr />

            {/* Seção de Academias */}
            <div className="section-container">
                <h3>Minhas Academias</h3>
                {loading ? <p>Carregando academias...</p> : (
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