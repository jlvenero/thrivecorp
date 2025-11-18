import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import ChangePasswordPage from './index';
import { API_URL } from '../../apiConfig'; // CORREÇÃO 1: Adiciona API_URL

// Simula a biblioteca 'axios'
vi.mock('axios');

describe('ChangePasswordPage', () => {

  // Melhora a estabilidade limpando mocks após cada teste
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Função helper para renderizar o componente
  const renderComponent = () => {
    render(
      <MemoryRouter>
        <ChangePasswordPage />
      </MemoryRouter>
    );
  };

  it('deve renderizar todos os campos do formulário', () => {
    renderComponent();
    
    // Usando RegEx para compatibilidade com MUI/asteriscos
    expect(screen.getByRole('heading', { name: /Alterar Senha/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha Atual/i)).toBeInTheDocument();
    // CORREÇÃO 2: Usa âncora ^ (começo da string) para unificar a busca
    expect(screen.getByLabelText(/^Nova Senha/i)).toBeInTheDocument(); 
    expect(screen.getByLabelText(/Confirme a Nova Senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Alterar Senha' })).toBeInTheDocument();
  });

  it('deve mostrar um erro se as novas senhas não coincidirem', async () => {
    renderComponent();

    // Simula a digitação do usuário usando a nova RegEx
    fireEvent.change(screen.getByLabelText(/Senha Atual/i), { target: { value: 'senhaAntiga123' } });
    fireEvent.change(screen.getByLabelText(/^Nova Senha/i), { target: { value: 'novaSenha' } }); // CORREÇÃO 3
    fireEvent.change(screen.getByLabelText(/Confirme a Nova Senha/i), { target: { value: 'senhaDiferente' } });

    // Simula o clique no botão
    fireEvent.click(screen.getByRole('button', { name: 'Alterar Senha' }));

    // Espera (await) o componente atualizar e mostrar a mensagem de erro
    const errorMessage = await screen.findByText('A nova senha e a confirmação não coincidem.');
    expect(errorMessage).toBeInTheDocument();
  });

  it('deve mostrar mensagem de sucesso ao submeter o formulário corretamente', async () => {
    // Simula uma resposta de sucesso do axios
    axios.put.mockResolvedValue({ data: {} });

    renderComponent();

    // Simula a digitação correta usando a nova RegEx
    fireEvent.change(screen.getByLabelText(/Senha Atual/i), { target: { value: 'senhaAntiga123' } });
    fireEvent.change(screen.getByLabelText(/^Nova Senha/i), { target: { value: 'novaSenha123' } }); // CORREÇÃO 4
    fireEvent.change(screen.getByLabelText(/Confirme a Nova Senha/i), { target: { value: 'novaSenha123' } });
    
    // Simula o clique
    fireEvent.click(screen.getByRole('button', { name: 'Alterar Senha' }));

    // Espera pela mensagem de sucesso
    const successMessage = await screen.findByText('Senha alterada com sucesso!');
    expect(successMessage).toBeInTheDocument();

    // Verifica se o axios foi chamado corretamente
    expect(axios.put).toHaveBeenCalledWith(
      `${API_URL}/api/auth/change-password`, // A URL
      { oldPassword: 'senhaAntiga123', newPassword: 'novaSenha123' }, // O body
      expect.anything() // O terceiro argumento (headers)
    );
  });
});