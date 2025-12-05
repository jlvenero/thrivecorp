import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

vi.mock('./pages/LoginPage/index', () => ({ default: () => <div data-testid="page-login">Login Page</div> }));
vi.mock('./pages/RegisterPage/index', () => ({ default: () => <div data-testid="page-register">Register Page</div> }));
vi.mock('./pages/PendingApprovalPage', () => ({ default: () => <div data-testid="page-pending">Pending Approval</div> }));
vi.mock('./pages/ChangePasswordPage', () => ({ default: () => <div data-testid="page-change-password">Change Password</div> }));

vi.mock('./pages/ColaboradorDashboard', () => ({ default: () => <div data-testid="dash-colaborador">Colaborador Dash</div> }));
vi.mock('./pages/CompanyAdminDashboard', () => ({ default: () => <div data-testid="dash-company">Company Admin Dash</div> }));
vi.mock('./pages/ProviderDashboard', () => ({ default: () => <div data-testid="dash-provider">Provider Dash</div> }));

vi.mock('./pages/AdminAprovarEmpresas', () => ({ default: () => <div data-testid="admin-empresas">Admin Empresas</div> }));
vi.mock('./pages/AdminAprovarAcademias', () => ({ default: () => <div data-testid="admin-academias">Admin Academias</div> }));
vi.mock('./pages/AdminBillingReport', () => ({ default: () => <div data-testid="admin-billing">Admin Billing</div> }));
vi.mock('./pages/AdminManageAdmins', () => ({ default: () => <div data-testid="admin-manage">Admin Manage</div> }));

vi.mock('./pages/Dashboard', () => ({
  default: ({ onLogout }) => (
    <div data-testid="layout-dashboard">
      <h1>Layout Wrapper</h1>
      <button data-testid="btn-logout" onClick={onLogout}>Sair</button>
      <div id="outlet-content">
         <mock-outlet /> 
      </div>
    </div>
  )
}));

vi.mock('./routes/PrivateRoute', () => ({
  default: ({ children }) => <>{children}</> 
}));

vi.mock('./pages/Dashboard', async () => {
  const { Outlet } = await import('react-router-dom');
  return {
    default: ({ onLogout }) => (
      <div data-testid="layout-dashboard">
        <button data-testid="btn-logout" onClick={onLogout}>Sair</button>
        <Outlet /> 
      </div>
    )
  };
});


describe('App Component (Routing & Logic)', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderApp = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <App />
      </MemoryRouter>
    );
  };

  it('deve renderizar a página de Login na rota /login', () => {
    renderApp('/login');
    expect(screen.getByTestId('page-login')).toBeInTheDocument();
  });

  it('deve renderizar a página de Registro na rota /register', () => {
    renderApp('/register');
    expect(screen.getByTestId('page-register')).toBeInTheDocument();
  });


  it('deve renderizar o Dashboard do Colaborador quando role é "collaborator"', () => {
    localStorage.setItem('userRole', 'collaborator');
    localStorage.setItem('token', 'valid-token');

    renderApp('/dashboard');

    expect(screen.getByTestId('layout-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('dash-colaborador')).toBeInTheDocument();
  });

  it('deve renderizar o texto de Admin Thrive quando role é "thrive_admin"', () => {
    localStorage.setItem('userRole', 'thrive_admin');
    localStorage.setItem('token', 'valid-token');

    renderApp('/dashboard');

    expect(screen.getByText('Dashboard Thrive Admin')).toBeInTheDocument();
    expect(screen.getByText('Bem-vindo, Administrador!')).toBeInTheDocument();
  });

  it('deve redirecionar para /empresa/colaboradores quando role é "company_admin"', async () => {
    localStorage.setItem('userRole', 'company_admin');
    localStorage.setItem('token', 'valid-token');

    renderApp('/dashboard');

    expect(screen.getByTestId('dash-company')).toBeInTheDocument();
  });

  it('deve redirecionar para /prestador/academias quando role é "provider"', () => {
    localStorage.setItem('userRole', 'provider');
    localStorage.setItem('token', 'valid-token');

    renderApp('/dashboard');

    expect(screen.getByTestId('dash-provider')).toBeInTheDocument();
  });

  it('deve renderizar a tela de Aprovar Empresas na rota correta', () => {
    localStorage.setItem('token', 'valid-token');
    renderApp('/admin/empresas');
    expect(screen.getByTestId('admin-empresas')).toBeInTheDocument();
  });

  it('deve renderizar a tela de Relatório de Faturamento na rota correta', () => {
    localStorage.setItem('token', 'valid-token');
    renderApp('/admin/billing');
    expect(screen.getByTestId('admin-billing')).toBeInTheDocument();
  });

  it('deve realizar logout corretamente: limpar storage e ir para login', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('userRole', 'collaborator');

    renderApp('/dashboard');

    expect(screen.getByTestId('layout-dashboard')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBe('fake-token');

    const logoutBtn = screen.getByTestId('btn-logout');
    fireEvent.click(logoutBtn);

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('userRole')).toBeNull();

    await waitFor(() => {
        expect(screen.getByTestId('page-login')).toBeInTheDocument();
    });
  });
  
  it('deve redirecionar para login ao acessar uma rota inexistente (*)', () => {
    renderApp('/rota-que-nao-existe');
    expect(screen.getByTestId('page-login')).toBeInTheDocument();
  });

});