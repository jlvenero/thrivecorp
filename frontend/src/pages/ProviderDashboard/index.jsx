import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProviderDashboard.css';

const ProviderDashboard = () => {
    const [gyms, setGyms] = useState([]);
    const [accessReport, setAccessReport] = useState([]); // Estado para o relatório
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newGym, setNewGym] = useState({ name: '', address: '' });

    // Função unificada para buscar todos os dados necessários para a página
    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = { headers: { Authorization: `Bearer ${token}` } };
            
            // Requisição 1: Busca a lista de academias do prestador
            const gymsResponse = await axios.get('http://localhost:3000/api/gyms', headers);
            setGyms(gymsResponse.data);

            // Requisição 2: Busca o relatório de acessos
            const reportResponse = await axios.get('http://localhost:3000/api/accesses/provider-report', headers);
            setAccessReport(reportResponse.data);

        } catch (err) {
            setError('Falha ao buscar os dados do painel.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // O useEffect agora chama a função unificada
    useEffect(() => {
        fetchAllData();
    }, []);

    const handleFormChange = (e) => {
        setNewGym({
            ...newGym,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3000/api/provider/gyms', newGym, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewGym({ name: '', address: '' });
            fetchAllData(); // Atualiza todos os dados da página após o cadastro
        } catch (err) {
            setError('Falha ao cadastrar nova academia.');
            console.error(err);
        }
    };

    return (
        <div className="provider-dashboard-container">
            {/* Formulário para adicionar nova academia */}
            <div className="form-container">
                <h3>Cadastrar Nova Academia</h3>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="name" value={newGym.name} onChange={handleFormChange} placeholder="Nome da Academia" required />
                    <input type="text" name="address" value={newGym.address} onChange={handleFormChange} placeholder="Endereço Completo" required />
                    <button type="submit">Cadastrar e Enviar para Aprovação</button>
                </form>
            </div>
            <hr />

            {/* Lista de academias existentes */}
            <h3>Minhas Academias</h3>
            {gyms.length > 0 ? (
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
            ) : (
                !loading && <p>Nenhuma academia cadastrada.</p>
            )}
            <hr />
            
            {/* Seção do Relatório de Acessos */}
            <h3>Relatório de Check-ins</h3>
            {error && <p className="error-message">{error}</p>}
            {loading && <p>Carregando...</p>}
            {accessReport.length > 0 ? (
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
            ) : (
                !loading && <p>Nenhum check-in registrado ainda.</p>
            )}
        </div>
    );
};

export default ProviderDashboard;