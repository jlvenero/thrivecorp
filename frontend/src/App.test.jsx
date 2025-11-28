import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// --- 1. Mocks dos Componentes de Página ---
// Isso isola o teste do App. Não renderizamos as páginas reais, apenas identificadores.

vi.mock('./pages/LoginPage/index', () => ({ default: () => <div data-testid="page-login">Login Page</div> }));
vi.mock('./pages/RegisterPage/index', () => ({ default: () => <div data-testid="page-register">Register Page</div> }));
vi.mock('./pages/PendingApprovalPage', () => ({ default: () => <div data-testid="page-pending">Pending Approval</div> }));
vi.mock('./pages/ChangePasswordPage', () => ({ default: () => <div data-testid="page-change-password">Change Password</div> }));

// Mocks dos Dashboards Específicos
vi.mock('./pages/ColaboradorDashboard', () => ({ default: () => <div data-testid="dash-colaborador">Colaborador Dash</div> }));
vi.mock('./pages/CompanyAdminDashboard', () => ({ default: () => <div data-testid="dash-company">Company Admin Dash</div> }));
vi.mock('./pages/ProviderDashboard', () => ({ default: () => <div data-testid="dash-provider">Provider Dash</div> }));

// Mocks das Páginas de Admin
vi.mock('./pages/AdminAprovarEmpresas', () => ({ default: () => <div data-testid="admin-empresas">Admin Empresas</div> }));
vi.mock('./pages/AdminAprovarAcademias', () => ({ default: () => <div data-testid="admin-academias">Admin Academias</div> }));
vi.mock('./pages/AdminBillingReport', () => ({ default: () => <div data-testid="admin-billing">Admin Billing</div> }));
vi.mock('./pages/AdminManageAdmins', () => ({ default: () => <div data-testid="admin-manage">Admin Manage</div> }));

// --- 2. Mock do Layout e PrivateRoute ---

// Mock do DashboardLayout para testarmos o Logout
vi.mock('./pages/Dashboard', () => ({
  default: ({ onLogout }) => (
    <div data-testid="layout-dashboard">
      <h1>Layout Wrapper</h1>
      {/* Botão para simular o clique de logout vindo da Sidebar */}
      <button data-testid="btn-logout" onClick={onLogout}>Sair</button>
      <div id="outlet-content">
        {/* Em testes unitários de rotas aninhadas, o Outlet é renderizado automaticamente pelo Router,
            mas aqui mockamos o componente pai. O React Router injeta as rotas filhas. 
            O Outlet real seria importado, mas simplificamos focando que o Layout renderizou.
            Para rotas filhas funcionarem dentro de um mock, usamos um componente "PassThrough" ou apenas verificamos a rota.
            Neste caso, como o App define as rotas DENTRO do Route element, o Outlet é implícito. 
            Vamos simplificar: O App renderiza <DashboardLayout /> que envolve as rotas filhas.
            
            O problema: O componente App passa <DashboardLayout> como element do Route pai.
            O React Router usa <Outlet /> internamente. Como mockamos o DashboardLayout, 
            precisamos garantir que ele renderize {children} ou <Outlet /> se fosse passado como prop.
            Mas no código do App, o <DashboardLayout /> não recebe children explícito, ele é o 'element'.
            
            SOLUÇÃO: Para o teste de App.jsx funcionar com rotas aninhadas quando o pai é mockado,
            precisamos importar o Outlet real no mock ou mockar o PrivateRoute para apenas repassar.
         */}
         <mock-outlet /> 
      </div>
    </div>
  )
}));

// Precisamos mockar o Outlet do react-router-dom para que o conteúdo aninhado apareça dentro do nosso Layout mockado?
// O React Router DOM lida com isso. No entanto, como mockamos o componente visual, o <Outlet/> real sumiu.
// Truque: O App usa `element={<PrivateRoute><DashboardLayout ... /></PrivateRoute>}`.
// As rotas filhas (ex: /dashboard) são renderizadas ONDE houver um <Outlet/>.
// Como mockamos o DashboardLayout, removemos o <Outlet/>.
// AJUSTE: Vamos usar `vi.mock` parcial ou simplificar o teste verificando apenas se o componente alvo foi chamado.
// Mas para testar renderização na tela, precisamos do Outlet.

// Vamos fazer o PrivateRoute apenas renderizar o `children`.
vi.mock('./routes/PrivateRoute', () => ({
  default: ({ children }) => <>{children}</> 
}));

// RE-MOCK do DashboardLayout para incluir o Outlet real, permitindo que as rotas filhas renderizem
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

  // Helper para renderizar o App dentro do MemoryRouter
  // O App usa `useNavigate`, então ele DEVE estar dentro de um Router.
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

  // --- Testes do DefaultDashboard (Lógica de Roles) ---

  it('deve renderizar o Dashboard do Colaborador quando role é "collaborator"', () => {
    localStorage.setItem('userRole', 'collaborator');
    localStorage.setItem('token', 'valid-token');

    renderApp('/dashboard');

    expect(screen.getByTestId('layout-dashboard')).toBeInTheDocument(); // Garante que está no layout privado
    expect(screen.getByTestId('dash-colaborador')).toBeInTheDocument(); // Garante o componente correto
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

    // O componente faz um <Navigate to="..." />, então devemos ver o componente da nova rota
    expect(screen.getByTestId('dash-company')).toBeInTheDocument();
  });

  it('deve redirecionar para /prestador/academias quando role é "provider"', () => {
    localStorage.setItem('userRole', 'provider');
    localStorage.setItem('token', 'valid-token');

    renderApp('/dashboard');

    expect(screen.getByTestId('dash-provider')).toBeInTheDocument();
  });

  // --- Testes de Rotas Específicas de Admin ---

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

  // --- Teste de Logout ---

  it('deve realizar logout corretamente: limpar storage e ir para login', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('userRole', 'collaborator');

    renderApp('/dashboard');

    // Verifica estado inicial
    expect(screen.getByTestId('layout-dashboard')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBe('fake-token');

    // Encontra e clica no botão de sair (que está no mock do Layout, recebendo a prop onLogout)
    const logoutBtn = screen.getByTestId('btn-logout');
    fireEvent.click(logoutBtn);

    // Verifica se limpou o storage
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('userRole')).toBeNull();

    // Verifica se redirecionou para login
    // Como estamos num MemoryRouter, verificamos se o componente de login apareceu
    await waitFor(() => {
        expect(screen.getByTestId('page-login')).toBeInTheDocument();
    });
  });

  // --- Teste de Redirecionamento (Rota desconhecida) ---
  
  it('deve redirecionar para login ao acessar uma rota inexistente (*)', () => {
    renderApp('/rota-que-nao-existe');
    expect(screen.getByTestId('page-login')).toBeInTheDocument();
  });

});