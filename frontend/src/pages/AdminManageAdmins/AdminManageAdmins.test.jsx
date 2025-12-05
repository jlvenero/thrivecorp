import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import AdminManageAdmins from './index.jsx';

vi.mock('axios');

vi.mock('../../apiConfig', () => ({
  API_URL: 'http://localhost:3000'
}));

describe('AdminManageAdmins Component', () => {
  beforeEach(() => {
    Storage.prototype.getItem = vi.fn(() => 'fake-admin-token');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o formulário corretamente com todos os campos', () => {
    render(<AdminManageAdmins />);

    expect(screen.getByText(/Gerenciar Administradores ThriveCorp/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Primeiro Nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sobrenome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha Provisória/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Criar Administrador/i })).toBeInTheDocument();
  });

  it('deve permitir que o usuário digite nos campos', () => {
    render(<AdminManageAdmins />);

    const firstNameInput = screen.getByLabelText(/Primeiro Nome/i);
    const emailInput = screen.getByLabelText(/Email/i);

    fireEvent.change(firstNameInput, { target: { value: 'João' } });
    fireEvent.change(emailInput, { target: { value: 'joao@teste.com' } });

    expect(firstNameInput.value).toBe('João');
    expect(emailInput.value).toBe('joao@teste.com');
  });

  it('deve enviar os dados corretamente e exibir mensagem de sucesso', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Criado' } });

    render(<AdminManageAdmins />);

    fireEvent.change(screen.getByLabelText(/Primeiro Nome/i), { target: { value: 'Maria' } });
    fireEvent.change(screen.getByLabelText(/Sobrenome/i), { target: { value: 'Silva' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'maria@admin.com' } });
    fireEvent.change(screen.getByLabelText(/Senha Provisória/i), { target: { value: '123456' } });

    const submitButton = screen.getByRole('button', { name: /Criar Administrador/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3000/api/admin/admins',
      {
        first_name: 'Maria',
        last_name: 'Silva',
        email: 'maria@admin.com',
        password: '123456'
      },
      {
        headers: { Authorization: 'Bearer fake-admin-token' }
      }
    );

    expect(screen.getByText(/Administrador "Maria" criado com sucesso!/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/Primeiro Nome/i).value).toBe('');
    expect(screen.getByLabelText(/Email/i).value).toBe('');
  });

  it('deve exibir mensagem de erro quando a API falhar', async () => {
    const errorMessage = 'Email já cadastrado';
    axios.post.mockRejectedValueOnce({
      response: { data: { error: errorMessage } }
    });

    render(<AdminManageAdmins />);

    fireEvent.change(screen.getByLabelText(/Primeiro Nome/i), { target: { value: 'Carlos' } });
    fireEvent.change(screen.getByLabelText(/Sobrenome/i), { target: { value: 'Teste' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'erro@teste.com' } });
    fireEvent.change(screen.getByLabelText(/Senha Provisória/i), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: /Criar Administrador/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(screen.queryByText(/criado com sucesso/i)).not.toBeInTheDocument();
  });

  it('deve exibir mensagem de erro genérica se a resposta da API não tiver detalhes', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network Error'));

    render(<AdminManageAdmins />);

    fireEvent.change(screen.getByLabelText(/Primeiro Nome/i), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText(/Sobrenome/i), { target: { value: 'B' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'c@c.com' } });
    fireEvent.change(screen.getByLabelText(/Senha Provisória/i), { target: { value: '1' } });

    fireEvent.click(screen.getByRole('button', { name: /Criar Administrador/i }));

    await waitFor(() => {
      expect(screen.getByText('Falha ao criar administrador.')).toBeInTheDocument();
    });
  });

  it('deve desabilitar o botão enquanto carrega (loading state)', async () => {
    axios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<AdminManageAdmins />);

    fireEvent.change(screen.getByLabelText(/Primeiro Nome/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Sobrenome/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 't@t.com' } });
    fireEvent.change(screen.getByLabelText(/Senha Provisória/i), { target: { value: '123' } });

    const button = screen.getByRole('button', { name: /Criar Administrador/i });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    await waitFor(() => expect(button).not.toBeDisabled(), { timeout: 1500 });
  });
});