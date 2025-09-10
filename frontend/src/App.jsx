import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/loginPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminAprovarEmpresas from './pages/AdminAprovarEmpresas';
import AdminAprovarAcademias from './pages/AdminAprovarAcademias';
import ProviderDashboard from './pages/ProviderDashboard';
import PrivateRoute from './routes/PrivateRoute';

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
                <Route element={<PrivateRoute />}>
                    {/* Apenas uma rota protegida para o dashboard */}
                    <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} />} />
                    <Route path="/admin/empresas" element={<AdminAprovarEmpresas />} />
                    <Route path="/admin/academias" element={<AdminAprovarAcademias />} />
                    <Route path="/prestador/academias" element={<ProviderDashboard />} />
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </div>
    );
}

export default App;