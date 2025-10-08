import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import CssBaseline from '@mui/material/CssBaseline';

import LoginPage from './pages/LoginPage/index';
import RegisterPage from './pages/RegisterPage/index';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './routes/PrivateRoute';
import PendingApprovalPage from './pages/PendingApprovalPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import AdminAprovarEmpresas from './pages/AdminAprovarEmpresas';
import AdminAprovarAcademias from './pages/AdminAprovarAcademias';
import AdminBillingReport from './pages/AdminBillingReport';
import AdminManageAdmins from './pages/AdminManageAdmins';
import ProviderDashboard from './pages/ProviderDashboard';
import CompanyAdminDashboard from './pages/CompanyAdminDashboard';
import ColaboradorDashboard from './pages/ColaboradorDashboard';

function App() {
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

                <Route
                    element={
                        <PrivateRoute>
                            <Dashboard onLogout={handleLogout} />
                        </PrivateRoute>
                    }
                >
                    <Route path="/dashboard" element={<h1>Bem-vindo!</h1>} />
                    <Route path="/change-password" element={<ChangePasswordPage />} />
                    
                    <Route path="/admin/empresas" element={<AdminAprovarEmpresas />} />
                    <Route path="/admin/academias" element={<AdminAprovarAcademias />} />
                    <Route path="/admin/billing" element={<AdminBillingReport />} />
                    <Route path="/admin/manage-admins" element={<AdminManageAdmins />} />

                    <Route path="/empresa/colaboradores" element={<CompanyAdminDashboard />} />

                    <Route path="/prestador/academias" element={<ProviderDashboard />} />
                    
                    <Route path="/colaborador/dashboard" element={<ColaboradorDashboard />} />
                </Route>
                
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </ThemeProvider>
    );
}

export default App;