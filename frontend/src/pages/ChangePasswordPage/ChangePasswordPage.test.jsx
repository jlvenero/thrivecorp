// frontend/src/pages/ChangePasswordPage/ChangePasswordPage.test.jsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import ChangePasswordPage from './index';

// Simula a biblioteca 'axios'
vi.mock('axios');

describe('ChangePasswordPage', () => {

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
    
// Agora usa RegEx para compatibilidade com MUI/asteriscos
    expect(screen.getByRole('heading', { name: /Alterar Senha/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha Atual/i)).toBeInTheDocument(); // <-- CORRIGIDO
    expect(screen.getByLabelText(/Nova Senha/i)).toBeInTheDocument(); // <-- CORRIGIDO
    expect(screen.getByLabelText(/Confirme a Nova Senha/i)).toBeInTheDocument(); // <-- CORRIGIDO
    expect(screen.getByRole('button', { name: 'Alterar Senha' })).toBeInTheDocument();
  });

  it('deve mostrar um erro se as novas senhas não coincidirem', async () => {
    renderComponent();

    // Simula a digitação do usuário
    fireEvent.change(screen.getByLabelText(/Senha Atual/i), { target: { value: 'senhaAntiga123' } }); // <-- CORRIGIDO
    fireEvent.change(screen.getByLabelText(/Nova Senha/i), { target: { value: 'novaSenha' } }); // <-- CORRIGIDO
    fireEvent.change(screen.getByLabelText(/Confirme a Nova Senha/i), { target: { value: 'senhaDiferente' } }); // <-- CORRIGIDO
    // Simula o clique no botão
    fireEvent.click(screen.getByRole('button', { name: 'Alterar Senha' }));

    // Espera (await) o componente atualizar e mostrar a mensagem de erro
    // Usamos 'findByText' porque ele espera o elemento aparecer
    const errorMessage = await screen.findByText('A nova senha e a confirmação não coincidem.');
    expect(errorMessage).toBeInTheDocument();
  });

  it('deve mostrar mensagem de sucesso ao submeter o formulário corretamente', async () => {
    // Simula uma resposta de sucesso do axios
    axios.put.mockResolvedValue({ data: {} });

    renderComponent();

    // Simula a digitação correta
    fireEvent.change(screen.getByLabelText(/Senha Atual/i), { target: { value: 'senhaAntiga123' } }); // <-- CORRIGIDO
    fireEvent.change(screen.getByLabelText(/Nova Senha/i), { target: { value: 'novaSenha123' } }); // <-- CORRIGIDO
    fireEvent.change(screen.getByLabelText(/Confirme a Nova Senha/i), { target: { value: 'novaSenha123' } }); // <-- CORRIGIDO
    
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