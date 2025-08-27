// src/pages/Dashboard.jsx
import React from 'react';

const Dashboard = ({ onLogout }) => {
    return (
        <div>
            <h2>Dashboard</h2>
            <p>Bem-vindo! Você está em uma rota protegida.</p>
            <button onClick={onLogout}>Sair</button>
        </div>
    );
};

export default Dashboard;