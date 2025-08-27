import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    // Obtém o token do localStorage
    const token = localStorage.getItem('token');

    // Se o token existe, a rota é liberada para renderizar o componente filho
    // Se o token não existe, redireciona para a página de login
    return token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;