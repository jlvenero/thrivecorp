import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const userRole = localStorage.getItem('userRole');

  return (
    <aside className="sidebar-container">
      <h3>Menu ThriveCorp</h3>
      <nav>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/change-password">Alterar Senha</Link></li>

          {userRole === 'thrive_admin' && (
            <>
              <li><Link to="/admin/empresas">Aprovar Empresas</Link></li>
              <li><Link to="/admin/academias">Aprovar Academias</Link></li>
              <li><Link to="/admin/billing">Extrato de Faturamento</Link></li>
            </>
          )}
          {userRole === 'company_admin' && (
            <>
              <li><Link to="/empresa/colaboradores">Gerenciar Colaboradores</Link></li>
            </>
          )}
          {userRole === 'provider' && (
            <>
              <li><Link to="/prestador/academias">Minhas Academias</Link></li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;