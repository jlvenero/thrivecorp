import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage/index';
import RegisterPage from './pages/RegisterPage/index';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminAprovarEmpresas from './pages/AdminAprovarEmpresas';
import AdminAprovarAcademias from './pages/AdminAprovarAcademias';
import ProviderDashboard from './pages/ProviderDashboard';
import PrivateRoute from './routes/PrivateRoute';
import CompanyAdminDashboard from './pages/CompanyAdminDashboard';
import AdminBillingReport from './pages/AdminBillingReport';
import PendingApprovalPage from './pages/PendingApprovalPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import AdminManageAdmins from './pages/AdminManageAdmins';


function App() {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    return (
        <div className="App">
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/pending-approval" element={<PendingApprovalPage />} />

                <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} />} />
                    <Route path="/change-password" element={<ChangePasswordPage />} />
                    <Route path="/admin/empresas" element={<AdminAprovarEmpresas />} />
                    <Route path="/admin/academias" element={<AdminAprovarAcademias />} />
                    <Route path="/admin/billing" element={<AdminBillingReport />} /> 
                    <Route path="/prestador/academias" element={<ProviderDashboard />} />
                    <Route path="/empresa/colaboradores" element={<CompanyAdminDashboard />} />
                    <Route path="/admin/manage-admins" element={<AdminManageAdmins />} />
                </Route>
                
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </div>
    );
}

export default App;