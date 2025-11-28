import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute'; // Ajuste o caminho se necessário

describe('PrivateRoute Component', () => {
  
  // Limpa o localStorage antes de cada teste para garantir isolamento
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('deve renderizar o conteúdo filho (children) quando houver um token', () => {
    // 1. Configuração: Simula usuário logado
    localStorage.setItem('token', 'valid-fake-token');

    // 2. Renderização
    render(
      <MemoryRouter initialEntries={['/protegido']}>
        <PrivateRoute>
          <div data-testid="protected-content">Conteúdo Secreto</div>
        </PrivateRoute>
      </MemoryRouter>
    );

    // 3. Verificação
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo Secreto')).toBeInTheDocument();
  });

  it('deve redirecionar para /login quando NÃO houver token', () => {
    // 1. Configuração: Garante que não tem token (usuário deslogado)
    localStorage.removeItem('token');

    // 2. Renderização com Sistema de Rotas
    // Precisamos definir a rota de login para verificar se o redirecionamento aconteceu
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

    // 3. Verificação
    
    // O conteúdo secreto NÃO deve estar na tela
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    
    // A página de login DEVE estar na tela (provando que o <Navigate to="/login" /> funcionou)
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });
});