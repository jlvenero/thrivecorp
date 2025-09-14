import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProviderDashboard = () => {
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchGyms = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/providers/gyms', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
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

    if (loading) return <p>Carregando academias...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h3>Minhas Academias</h3>
            {gyms.length > 0 ? (
                <ul>
                    {gyms.map(gym => (
                        <li key={gym.id}>
                            {gym.name} (Endereço: {gym.address}) - Status: **{gym.status}**
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Nenhuma academia encontrada.</p>
            )}
        </div>
    );
};

export default ProviderDashboard;