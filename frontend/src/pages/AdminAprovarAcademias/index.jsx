import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminAprovarAcademias.css';

const AdminAprovarAcademias = () => {
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchGyms = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/gyms/all', {
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

    const handleApprove = async (gymId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3000/api/gyms/${gymId}/approve`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchGyms();
        } catch (err) {
            setError('Falha ao aprovar a academia.');
            console.error(err);
        }
    };

    const handleReprove = async (gymId) => {
        if (window.confirm("Tem certeza que deseja reprovar esta academia? Esta ação não pode ser desfeita.")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:3000/api/gyms/${gymId}/reprove`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                fetchGyms();
            } catch (err) {
                setError('Falha ao reprovar a academia.');
                console.error(err);
            }
        }
    };

    useEffect(() => {
        fetchGyms();
    }, []);

    if (loading) return <p>Carregando academias...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="admin-aprovar-academias-container">
            <h3>Aprovação de Academias</h3>
            {gyms.length > 0 ? (
                <ul>
                    {gyms.map(gym => (
                        <li key={gym.id}>
                            <div className="gym-info">
                                {gym.name} (Endereço: {gym.address}) - <span className={`status ${gym.status}`}>Status: {gym.status}</span>
                            </div>
                            {gym.status === 'pending' && (
                                <div className="actions">
                                    <button className="approve-btn" onClick={() => handleApprove(gym.id)}>
                                        Aprovar
                                    </button>
                                    <button className="reprove-btn" onClick={() => handleReprove(gym.id)}>
                                        Reprovar
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Nenhuma academia encontrada para aprovação.</p>
            )}
        </div>
    );
};

export default AdminAprovarAcademias;