import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import AdminManageAdmins from './index.jsx';

// 1. Mock do Axios para interceptar chamadas HTTP
vi.mock('axios');

// 2. Mock da constante de configuração da API
vi.mock('../../apiConfig', () => ({
  API_URL: 'http://localhost:3000'
}));

describe('AdminManageAdmins Component', () => {
  // Setup antes de cada teste
  beforeEach(() => {
    // Mock do localStorage
    Storage.prototype.getItem = vi.fn(() => 'fake-admin-token');
  });

  // Limpeza após cada teste
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
    // Configura o mock do axios para retornar sucesso
    axios.post.mockResolvedValueOnce({ data: { message: 'Criado' } });

    render(<AdminManageAdmins />);

    // Preenche o formulário
    fireEvent.change(screen.getByLabelText(/Primeiro Nome/i), { target: { value: 'Maria' } });
    fireEvent.change(screen.getByLabelText(/Sobrenome/i), { target: { value: 'Silva' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'maria@admin.com' } });
    fireEvent.change(screen.getByLabelText(/Senha Provisória/i), { target: { value: '123456' } });

    // Clica no botão
    const submitButton = screen.getByRole('button', { name: /Criar Administrador/i });
    fireEvent.click(submitButton);

    // Verifica se o estado de loading aparece (o botão muda ou aparece o spinner)
    // Nota: Como o React é rápido, às vezes o loading é muito breve, mas podemos checar se o axios foi chamado
    
    // Aguarda a chamada do Axios e as asserções
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    // Verifica os argumentos passados para o Axios (URL, Body, Headers)
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

    // Verifica se a mensagem de sucesso apareceu
    expect(screen.getByText(/Administrador "Maria" criado com sucesso!/i)).toBeInTheDocument();

    // Verifica se o formulário foi limpo
    expect(screen.getByLabelText(/Primeiro Nome/i).value).toBe('');
    expect(screen.getByLabelText(/Email/i).value).toBe('');
  });

  it('deve exibir mensagem de erro quando a API falhar', async () => {
    // Configura o mock do axios para retornar erro
    const errorMessage = 'Email já cadastrado';
    axios.post.mockRejectedValueOnce({
      response: { data: { error: errorMessage } }
    });

    render(<AdminManageAdmins />);

    // Preenche minimamente para submeter
    fireEvent.change(screen.getByLabelText(/Primeiro Nome/i), { target: { value: 'Carlos' } });
    fireEvent.change(screen.getByLabelText(/Sobrenome/i), { target: { value: 'Teste' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'erro@teste.com' } });
    fireEvent.change(screen.getByLabelText(/Senha Provisória/i), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: /Criar Administrador/i }));

    // Aguarda a mensagem de erro
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Garante que não apareceu mensagem de sucesso
    expect(screen.queryByText(/criado com sucesso/i)).not.toBeInTheDocument();
  });

  it('deve exibir mensagem de erro genérica se a resposta da API não tiver detalhes', async () => {
    // Mock de erro sem response.data.error (ex: erro de rede)
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
    // Cria uma promise que nunca resolve imediatamente para podermos checar o estado de loading
    axios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<AdminManageAdmins />);
    
    // Preenche campos obrigatórios
    fireEvent.change(screen.getByLabelText(/Primeiro Nome/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Sobrenome/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 't@t.com' } });
    fireEvent.change(screen.getByLabelText(/Senha Provisória/i), { target: { value: '123' } });

    const button = screen.getByRole('button', { name: /Criar Administrador/i });
    fireEvent.click(button);

    // Verifica se o botão está desabilitado logo após o clique
    expect(button).toBeDisabled();
    
    // Verifica se o CircularProgress (spinner) está na tela. 
    // O MUI CircularProgress tem role="progressbar"
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Aguarda o fim do teste para evitar warning de update state
    await waitFor(() => expect(button).not.toBeDisabled(), { timeout: 1500 });
  });
});