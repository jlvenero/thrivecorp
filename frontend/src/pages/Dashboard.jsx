import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar/index.jsx';
import AdminAprovarEmpresas from './AdminAprovarEmpresas';
import AdminAprovarAcademias from './AdminAprovarAcademias';
import ProviderDashboard from './ProviderDashboard';
import CompanyAdminDashboard from './CompanyAdminDashboard';
import ColaboradorDashboard from './ColaboradorDashboard';

const Dashboard = ({ onLogout }) => {
    const [userRole, setUserRole] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        setUserRole(role);
    }, []);

    const renderContent = () => {
        if (userRole === 'thrive_admin') {
        if (location.pathname === '/admin/academias') {
            return <AdminAprovarAcademias />;
        }
        // Se a role é 'thrive_admin', renderiza o painel de aprovação de empresas por padrão
        return <AdminAprovarEmpresas />;
        } else if (userRole === 'provider') {
            if (location.pathname === '/prestador/academias') {
                return <ProviderDashboard />;
            }
            return <div>Bem-vindo, Prestador! Use o menu lateral para gerenciar suas academias.</div>;
        } else if (userRole === 'company_admin') {
            if (location.pathname === '/empresa/colaboradores') {
                return <CompanyAdminDashboard />;
            }
            return <div>Bem-vindo, Administrador da Empresa! Use o menu lateral para gerenciar.</div>;
        } else {
            return <ColaboradorDashboard />;
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