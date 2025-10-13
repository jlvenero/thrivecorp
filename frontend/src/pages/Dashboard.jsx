import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar/index.jsx';
import AdminAprovarEmpresas from './AdminAprovarEmpresas/index.jsx';
import AdminAprovarAcademias from './AdminAprovarAcademias/index.jsx';
import ProviderDashboard from './ProviderDashboard';
import CompanyAdminDashboard from './CompanyAdminDashboard';
import ColaboradorDashboard from './ColaboradorDashboard/index.jsx';

const Dashboard = ({ onLogout }) => {
    const [userRole, setUserRole] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        setUserRole(role);
    }, []);

    const renderContent = () => {
        switch (userRole) {
            case 'thrive_admin':
                if (location.pathname === '/admin/academias') {
                    return <AdminAprovarAcademias />;
                }
                return <AdminAprovarEmpresas />;

            case 'provider':
                return <ProviderDashboard />;

            case 'company_admin':
                return <CompanyAdminDashboard />;

            case 'collaborator':
                return <ColaboradorDashboard />;

            default:
                return <div>Bem-vindo!</div>;
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f0f2f5' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                {renderContent()}
                <button 
                    onClick={onLogout} 
                    style={{
                        position: 'absolute', 
                        bottom: '20px', 
                        right: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Sair
                </button>
            </main>
        </div>
    );
};

export default Dashboard;