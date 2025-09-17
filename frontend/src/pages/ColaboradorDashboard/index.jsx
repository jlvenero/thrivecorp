import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ColaboradorDashboard.css';

const ColaboradorDashboard = () => {
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

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

    const handleCheckIn = async (gymId, gymName) => {
        // Limpa mensagens anteriores
        setError('');
        setSuccessMessage('');

        if (window.confirm(`Confirmar check-in na academia ${gymName}?`)) {
            try {
                const token = localStorage.getItem('token');
                await axios.post('http://localhost:3000/api/accesses', 
                    { gymId: gymId }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSuccessMessage(`Check-in em ${gymName} realizado com sucesso!`);
            } catch (err) {
                setError('Falha ao realizar o check-in.');
                console.error(err);
            }
        }
    };

    return (
        <div className="colaborador-dashboard-container">
            <h3>Academias Disponíveis</h3>
            {successMessage && <p className="success-message">{successMessage}</p>}
            {error && <p className="error-message">{error}</p>}
            {gyms.length > 0 ? (
                <ul>
                    {gyms.map(gym => (
                        <li key={gym.id}>
                            <div className="gym-details">
                                <span className="gym-name">{gym.name}</span>
                                <span className="gym-address">{gym.address}</span>
                            </div>
                            <button 
                                className="checkin-btn"
                                onClick={() => handleCheckIn(gym.id, gym.name)}
                            >
                                Fazer Check-in
                            </button>
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