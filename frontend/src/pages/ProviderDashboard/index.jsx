import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProviderDashboard.css';

const ProviderDashboard = () => {
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [newGym, setNewGym] = useState({ name: '', address: '' });

    const fetchGyms = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/gyms', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGyms(response.data);
        } catch (err) {
            setError('Falha ao buscar suas academias.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGyms();
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
            fetchGyms();
        } catch (err) {
            setError('Falha ao cadastrar nova academia.');
            console.error(err);
        }
    };

    return (
        <div className="provider-dashboard-container">
            <div className="form-container">
                <h3>Cadastrar Nova Academia</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        value={newGym.name}
                        onChange={handleFormChange}
                        placeholder="Nome da Academia"
                        required
                    />
                    <input
                        type="text"
                        name="address"
                        value={newGym.address}
                        onChange={handleFormChange}
                        placeholder="Endereço Completo"
                        required
                    />
                    <button type="submit">Cadastrar e Enviar para Aprovação</button>
                </form>
            </div>

            <hr />

            <h3>Minhas Academias</h3>
            {loading && <p>Carregando...</p>}
            {error && <p className="error-message">{error}</p>}
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
        </div>
    );
};

export default ProviderDashboard;