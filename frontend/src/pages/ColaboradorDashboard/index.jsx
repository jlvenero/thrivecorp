import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ColaboradorDashboard.css';

const ColaboradorDashboard = () => {
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchGyms = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/collaborator/gyms', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setGyms(response.data);
        } catch (err) {
            setError('Falha ao buscar as academias.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGyms();
    }, []);

    if (loading) return <p>Carregando academias...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="colaborador-dashboard-container">
            <h3>Academias Disponíveis</h3>
            {gyms.length > 0 ? (
                <ul>
                    {gyms.map(gym => (
                        <li key={gym.id}>
                            <span className="gym-name">{gym.name}</span>
                            <span className="gym-address">{gym.address}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Nenhuma academia disponível no momento.</p>
            )}
        </div>
    );
};

export default ColaboradorDashboard;