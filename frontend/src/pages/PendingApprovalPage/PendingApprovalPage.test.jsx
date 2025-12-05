import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PendingApprovalPage from './index';

describe('PendingApprovalPage Component', () => {
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <PendingApprovalPage />
      </MemoryRouter>
    );
  };

  it('deve renderizar o título e a mensagem de instrução corretamente', () => {
    renderComponent();

    const title = screen.getByRole('heading', { name: /Solicitação Recebida!/i, level: 2 });
    expect(title).toBeInTheDocument();

    const bodyText = screen.getByText(/Seu pedido de registro foi enviado para a equipe de administração/i);
    expect(bodyText).toBeInTheDocument();
    expect(screen.getByText(/Aguarde a ativação da sua conta/i)).toBeInTheDocument();
  });

  it('deve renderizar o botão de login com o link correto', () => {
    renderComponent();

    const loginButton = screen.getByRole('link', { name: /Acessar Página de Login/i });
    
    expect(loginButton).toBeInTheDocument();
    
    expect(loginButton).toHaveAttribute('href', '/login');
  });

  it('deve renderizar o ícone de ampulheta (Hourglass)', () => {
    const { container } = renderComponent();

    const icon = container.querySelector('svg[data-testid="HourglassEmptyIcon"]');
    
    expect(icon).toBeInTheDocument();
  });
});