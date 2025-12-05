import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';

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
    render(
      <MemoryRouter>
        <Dashboard onLogout={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();

    const mainArea = screen.getByRole('main');
    expect(mainArea).toBeInTheDocument();
  });

  it('deve renderizar o conteúdo das rotas filhas (Outlet)', () => {
    render(
      <MemoryRouter initialEntries={['/filho']}>
        <Routes>
          <Route path="/" element={<Dashboard onLogout={() => {}} />}>
            <Route path="filho" element={<div data-testid="child-content">Conteúdo da Rota Filha</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

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

    const logoutButton = screen.getByText('Botão Sair Mock');
    
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});