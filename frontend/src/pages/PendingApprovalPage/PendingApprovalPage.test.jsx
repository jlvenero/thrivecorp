import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PendingApprovalPage from './index'; // Ajuste o caminho se necessário

describe('PendingApprovalPage Component', () => {
  // Helper para renderizar com o Router (necessário pois o componente usa Link)
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <PendingApprovalPage />
      </MemoryRouter>
    );
  };

  it('deve renderizar o título e a mensagem de instrução corretamente', () => {
    renderComponent();

    // Verifica o Título Principal
    const title = screen.getByRole('heading', { name: /Solicitação Recebida!/i, level: 2 });
    expect(title).toBeInTheDocument();

    // Verifica o texto do corpo (usando regex para flexibilidade com quebras de linha)
    const bodyText = screen.getByText(/Seu pedido de registro foi enviado para a equipe de administração/i);
    expect(bodyText).toBeInTheDocument();
    expect(screen.getByText(/Aguarde a ativação da sua conta/i)).toBeInTheDocument();
  });

  it('deve renderizar o botão de login com o link correto', () => {
    renderComponent();

    // O componente Button com 'component={RouterLink}' renderiza uma tag <a> no DOM
    const loginButton = screen.getByRole('link', { name: /Acessar Página de Login/i });
    
    expect(loginButton).toBeInTheDocument();
    
    // Verifica se o atributo href aponta para a rota certa
    expect(loginButton).toHaveAttribute('href', '/login');
  });

  it('deve renderizar o ícone de ampulheta (Hourglass)', () => {
    const { container } = renderComponent();

    // Material UI renderiza ícones como SVGs. 
    // Buscamos o SVG que possui o atributo data-testid correspondente ao ícone
    // (Por padrão o MUI coloca o nome do ícone como data-testid)
    const icon = container.querySelector('svg[data-testid="HourglassEmptyIcon"]');
    
    expect(icon).toBeInTheDocument();
  });
});