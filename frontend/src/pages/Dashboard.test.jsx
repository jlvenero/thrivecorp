import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';

// 1. Mock do componente Sidebar
// Isso é CRUCIAL. Não queremos testar a Sidebar real aqui, apenas se o Dashboard a invoca.
// Se não mockarmos, o teste pode falhar por causa de localStorage, ícones ou contexto dentro da Sidebar real.
vi.mock('../components/Sidebar/index.jsx', () => ({
  default: ({ onLogout }) => (
    <div data-testid="mock-sidebar">
      <p>Sidebar Mockada</p>
      <button onClick={onLogout}>Botão Sair Mock</button>
    </div>
  )
}));

describe('Dashboard Layout Component', () => {
  
  it('deve renderizar a estrutura básica (Sidebar e Área Principal)', () => {
    // Renderizamos dentro de um Router simples pois o Dashboard usa Outlet
    render(
      <MemoryRouter>
        <Dashboard onLogout={() => {}} />
      </MemoryRouter>
    );

    // Verifica se a Sidebar (mockada) está presente
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();

    // Verifica se a área principal (tag <main>) existe
    // O Material UI Box com component="main" gera uma role="main"
    const mainArea = screen.getByRole('main');
    expect(mainArea).toBeInTheDocument();
  });

  it('deve renderizar o conteúdo das rotas filhas (Outlet)', () => {
    // Aqui testamos se o <Outlet /> está funcionando.
    // Criamos uma rota pai (Dashboard) e uma rota filha (Test Child).
    render(
      <MemoryRouter initialEntries={['/filho']}>
        <Routes>
          <Route path="/" element={<Dashboard onLogout={() => {}} />}>
            <Route path="filho" element={<div data-testid="child-content">Conteúdo da Rota Filha</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Se o Outlet estiver funcionando, esse texto deve aparecer DENTRO do Dashboard
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo da Rota Filha')).toBeInTheDocument();
  });

  it('deve repassar a função onLogout corretamente para a Sidebar', () => {
    const mockLogout = vi.fn();

    render(
      <MemoryRouter>
        <Dashboard onLogout={mockLogout} />
      </MemoryRouter>
    );

    // Encontra o botão dentro do nosso Mock de Sidebar
    const logoutButton = screen.getByText('Botão Sair Mock');
    
    // Simula o clique
    fireEvent.click(logoutButton);

    // Verifica se a função que passamos para o Dashboard chegou até a Sidebar
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});