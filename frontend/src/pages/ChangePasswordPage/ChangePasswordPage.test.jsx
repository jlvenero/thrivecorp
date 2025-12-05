import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import ChangePasswordPage from './index';
import { API_URL } from '../../apiConfig';

vi.mock('axios');

describe('ChangePasswordPage', () => {

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <ChangePasswordPage />
      </MemoryRouter>
    );
  };

  it('deve renderizar todos os campos do formulário', () => {
    renderComponent();
    
    expect(screen.getByRole('heading', { name: /Alterar Senha/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha Atual/i)).toBeInTheDocument(); 
    expect(screen.getByLabelText(/^Nova Senha/i)).toBeInTheDocument(); 
    expect(screen.getByLabelText(/Confirme a Nova Senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Alterar Senha' })).toBeInTheDocument();
  });

  it('deve mostrar um erro se as novas senhas não coincidirem', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Senha Atual/i), { target: { value: 'senhaAntiga123' } });
    fireEvent.change(screen.getByLabelText(/^Nova Senha/i), { target: { value: 'novaSenha' } });
    fireEvent.change(screen.getByLabelText(/Confirme a Nova Senha/i), { target: { value: 'senhaDiferente' } });

    fireEvent.click(screen.getByRole('button', { name: 'Alterar Senha' }));

    const errorMessage = await screen.findByText('A nova senha e a confirmação não coincidem.');
    expect(errorMessage).toBeInTheDocument();
  });

  it('deve mostrar mensagem de sucesso ao submeter o formulário corretamente', async () => {
    axios.put.mockResolvedValue({ data: {} });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Senha Atual/i), { target: { value: 'senhaAntiga123' } });
    fireEvent.change(screen.getByLabelText(/^Nova Senha/i), { target: { value: 'novaSenha123' } });
    fireEvent.change(screen.getByLabelText(/Confirme a Nova Senha/i), { target: { value: 'novaSenha123' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Alterar Senha' }));

    const successMessage = await screen.findByText('Senha alterada com sucesso!');
    expect(successMessage).toBeInTheDocument();

    expect(axios.put).toHaveBeenCalledWith(
      `${API_URL}/api/auth/change-password`,
      { oldPassword: 'senhaAntiga123', newPassword: 'novaSenha123' },
      expect.anything()
    );
  });

  it('deve mostrar erro se a senha for muito curta (< 3 caracteres)', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByLabelText(/Senha Atual/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/^Nova Senha/i), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText(/Confirme a Nova Senha/i), { target: { value: '12' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Alterar Senha' }));

    expect(await screen.findByText(/A nova senha deve ter pelo menos 3 caracteres/i)).toBeInTheDocument();
  });

  it('deve lidar com erro da API (ex: senha antiga incorreta)', async () => {
    const errorMessage = 'A senha antiga está incorreta.';
    axios.put.mockRejectedValue({ 
        response: { data: { error: errorMessage } } 
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Senha Atual/i), { target: { value: 'errada' } });
    fireEvent.change(screen.getByLabelText(/^Nova Senha/i), { target: { value: 'nova123' } });
    fireEvent.change(screen.getByLabelText(/Confirme a Nova Senha/i), { target: { value: 'nova123' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Alterar Senha' }));

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });
});