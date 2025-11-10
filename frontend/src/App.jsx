import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import CssBaseline from '@mui/material/CssBaseline';
import { API_URL } from './apiConfig';

import LoginPage from './pages/LoginPage/index';
import RegisterPage from './pages/RegisterPage/index';
import DashboardLayout from './pages/Dashboard'; // Renomeado para Layout
import PrivateRoute from './routes/PrivateRoute';
import PendingApprovalPage from './pages/PendingApprovalPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import AdminAprovarEmpresas from './pages/AdminAprovarEmpresas';
import AdminAprovarAcademias from './pages/AdminAprovarAcademias';
import AdminBillingReport from './pages/AdminBillingReport';
import AdminManageAdmins from './pages/AdminManageAdmins';
import ProviderDashboard from './pages/ProviderDashboard';
import CompanyAdminDashboard from './pages/CompanyAdminDashboard';
import ColaboradorDashboard from './pages/ColaboradorDashboard'; // Importado aqui
import { Box, Typography } from '@mui/material'; // Importar Box e Typography para a tela padrão

// Componente para decidir qual Dashboard mostrar
const DefaultDashboard = () => {
    const userRole = localStorage.getItem('userRole');

    switch (userRole) {
        case 'collaborator':
            return <ColaboradorDashboard />;
        case 'thrive_admin':
            // Poderia redirecionar para /admin/empresas ou mostrar um resumo
            return (
                <Box>
                    <Typography variant="h5">Dashboard Thrive Admin</Typography>
                    <Typography>Bem-vindo, Administrador!</Typography>
                    {/* Adicionar aqui cartões de resumo, links rápidos, etc. */}
                </Box>
            );
        case 'company_admin':
            // Redireciona para a gerência de colaboradores por padrão
             return <Navigate to="/empresa/colaboradores" replace />;
        case 'provider':
             // Redireciona para a gerência de academias por padrão
             return <Navigate to="/prestador/academias" replace />;
        default:
            // Caso genérico ou erro
            return <Typography>Bem-vindo!</Typography>;
    }
};

function App() {
    console.log('API_URL em uso:', API_URL);
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login', { replace: true });
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/pending-approval" element={<PendingApprovalPage />} />

                {/* Rota para o Layout do Dashboard que contém a Sidebar */}
                <Route
                    element={
                        <PrivateRoute>
                            {/* Passa a função de logout para o Layout */}
                            <DashboardLayout onLogout={handleLogout} />
                        </PrivateRoute>
                    }
                >
                    {/* Rota principal do dashboard agora usa o componente DefaultDashboard */}
                    <Route path="/dashboard" element={<DefaultDashboard />} />

                    {/* Outras rotas que usam o mesmo layout */}
                    <Route path="/change-password" element={<ChangePasswordPage />} />

                    {/* Rotas Admin */}
                    <Route path="/admin/empresas" element={<AdminAprovarEmpresas />} />
                    <Route path="/admin/academias" element={<AdminAprovarAcademias />} />
                    <Route path="/admin/billing" element={<AdminBillingReport />} />
                    <Route path="/admin/manage-admins" element={<AdminManageAdmins />} />

                    {/* Rota Company Admin */}
                    <Route path="/empresa/colaboradores" element={<CompanyAdminDashboard />} />

                    {/* Rota Provider */}
                    <Route path="/prestador/academias" element={<ProviderDashboard />} />

                    {/* Rota Colaborador (já tratada pelo DefaultDashboard, mas pode ter sub-rotas se necessário) */}
                    {/* Exemplo: <Route path="/colaborador/historico" element={<HistoricoCheckins />} /> */}

                     {/* Rota fallback dentro do dashboard, redireciona para a tela principal */}
                     <Route path="/" element={<Navigate to="/dashboard" replace />} />

                </Route>

                {/* Rota fallback geral, redireciona para login se não estiver autenticado */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </ThemeProvider>
    );
}

export default App;