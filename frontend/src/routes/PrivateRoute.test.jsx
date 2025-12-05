import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

describe('PrivateRoute Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('deve renderizar o conteúdo filho (children) quando houver um token', () => {
    localStorage.setItem('token', 'valid-fake-token');

    render(
      <MemoryRouter initialEntries={['/protegido']}>
        <PrivateRoute>
          <div data-testid="protected-content">Conteúdo Secreto</div>
        </PrivateRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo Secreto')).toBeInTheDocument();
  });

  it('deve redirecionar para /login quando NÃO houver token', () => {
    localStorage.removeItem('token');

    render(
      <MemoryRouter initialEntries={['/protegido']}>
        <Routes>
          {/* A rota protegida que tentamos acessar */}
          <Route 
            path="/protegido" 
            element={
              <PrivateRoute>
                <div data-testid="protected-content">Conteúdo Secreto</div>
              </PrivateRoute>
            } 
          />
          
          {/* A rota de destino do redirecionamento */}
          <Route 
            path="/login" 
            element={<div data-testid="login-page">Página de Login</div>} 
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });
});