import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './index';

describe('Sidebar Component', () => {
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  const renderSidebar = (role = 'collaborator', initialRoute = '/dashboard') => {
    localStorage.setItem('userRole', role);
    
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Sidebar onLogout={mockOnLogout} />
      </MemoryRouter>
    );
  };

  it('deve renderizar a estrutura básica (título e versão) corretamente', () => {
    renderSidebar('collaborator');

    expect(screen.getByText('Menu ThriveCorp')).toBeInTheDocument();
    expect(screen.getByText(/ThriveCorp Admin v/i)).toBeInTheDocument();
  });

  it('deve exibir o menu completo para o "thrive_admin"', () => {
    renderSidebar('thrive_admin');

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Alterar Senha')).toBeInTheDocument();

    expect(screen.getByText('Aprovar Empresas')).toBeInTheDocument();
    expect(screen.getByText('Aprovar Academias')).toBeInTheDocument();
    expect(screen.getByText('Extrato de Faturamento')).toBeInTheDocument();
    expect(screen.getByText('Gerenciar Admins')).toBeInTheDocument();

    expect(screen.queryByText('Gerenciar Colaboradores')).not.toBeInTheDocument();
    expect(screen.queryByText('Minhas Academias')).not.toBeInTheDocument();
  });

  it('deve exibir apenas o menu da empresa para "company_admin"', () => {
    renderSidebar('company_admin');

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('Gerenciar Colaboradores')).toBeInTheDocument();
    
    expect(screen.queryByText('Aprovar Empresas')).not.toBeInTheDocument();
    expect(screen.queryByText('Gerenciar Admins')).not.toBeInTheDocument();
  });

  it('deve exibir apenas o menu do prestador para "provider"', () => {
    renderSidebar('provider');

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('Minhas Academias')).toBeInTheDocument();

    expect(screen.queryByText('Gerenciar Colaboradores')).not.toBeInTheDocument();
  });

  it('deve chamar a função onLogout ao clicar no botão Sair', () => {
    renderSidebar('collaborator');

    const logoutButton = screen.getByRole('button', { name: /Sair/i });
    fireEvent.click(logoutButton);

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('deve aplicar a classe "active" ao link da rota atual', () => {
    localStorage.setItem('userRole', 'thrive_admin');
    
    render(
      <MemoryRouter initialEntries={['/admin/empresas']}>
        <Sidebar onLogout={mockOnLogout} />
      </MemoryRouter>
    );

    const activeLink = screen.getByText('Aprovar Empresas').closest('a');
    
    expect(activeLink).toHaveClass('active');
    
    const inactiveLink = screen.getByText('Dashboard').closest('a');
    expect(inactiveLink).not.toHaveClass('active');
  });
});