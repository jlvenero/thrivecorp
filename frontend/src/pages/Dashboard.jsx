import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar/index.jsx';
import AdminAprovarEmpresas from './AdminAprovarEmpresas.jsx';
import AdminAprovarAcademias from './AdminAprovarAcademias.jsx';

const Dashboard = ({ onLogout }) => {
    const [userRole, setUserRole] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        setUserRole(role);
    }, []);

    const renderContent = () => {
        if (userRole === 'thrive_admin') {
            if (location.pathname === '/admin/empresas') {
                return <AdminAprovarEmpresas />;
            }
            if (location.pathname === '/admin/academias') {
                return <AdminAprovarAcademias />;
            }
            return <div>Bem-vindo, Administrador! Use o menu lateral para gerenciar a plataforma.</div>;
        } else if (userRole === 'provider') {
            // ... lógica para o provider ...
        } else if (userRole === 'company_admin') {
            // ... lógica para o company_admin ...
        } else {
            // ... lógica para o colaborador padrão ...
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ flex: 1, padding: '20px' }}>
                {renderContent()}
                <button onClick={onLogout}>Sair</button>
            </div>
        </div>
    );
};

export default Dashboard;