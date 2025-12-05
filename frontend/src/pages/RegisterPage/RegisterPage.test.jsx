import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './index';

vi.mock('axios');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../apiConfig', () => ({
  API_URL: 'http://localhost:3000'
}));

describe('RegisterPage Component', () => {
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o formulário corretamente com campos padrão (Company Admin)', () => {
    renderComponent();

    expect(screen.getByText('ThriveCorp')).toBeInTheDocument();
    expect(screen.getByText('Crie a sua conta')).toBeInTheDocument();
    
    expect(screen.getByLabelText(/Primeiro Nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sobrenome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirme a Senha/i)).toBeInTheDocument();
    
    expect(screen.getByLabelText(/Tipo de Conta/i)).toBeInTheDocument();
    
    expect(screen.getByLabelText(/Nome da Empresa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CNPJ da Empresa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Endereço da Empresa/i)).toBeInTheDocument();

    expect(screen.queryByLabelText(/Nome do Fornecedor/i)).not.toBeInTheDocument();
  });

  it('deve alternar os campos ao mudar o Tipo de Conta para Fornecedor', async () => {
    renderComponent();

    const roleSelect = screen.getByLabelText(/Tipo de Conta/i);
    fireEvent.mouseDown(roleSelect);

    const providerOption = await screen.findByText('Fornecedor (Academia)');
    fireEvent.click(providerOption);

    expect(screen.getByLabelText(/Nome do Fornecedor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Documento Federal \(CNPJ\/CPF\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Endereço do Fornecedor/i)).toBeInTheDocument();

    expect(screen.queryByLabelText(/Nome da Empresa/i)).not.toBeInTheDocument();
  });

  it('deve aplicar a máscara de CPF corretamente (<= 11 dígitos)', async () => {
    renderComponent();
    
    const docInput = screen.getByLabelText(/CNPJ da Empresa/i);
    
    fireEvent.change(docInput, { target: { value: '12345678901' } });
    
    expect(docInput.value).toBe('123.456.789-01');
  });

  it('deve aplicar a máscara de CNPJ corretamente (> 11 dígitos)', async () => {
    renderComponent();
    const docInput = screen.getByLabelText(/CNPJ da Empresa/i);

    fireEvent.change(docInput, { target: { value: '12345678000199' } });
    
    expect(docInput.value).toBe('12.345.678/0001-99');
  });

  it('deve mostrar/ocultar senha ao clicar no ícone de olho', () => {
    renderComponent();
    const passwordInput = screen.getByLabelText(/^Senha/i);
    
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButtons = screen.getAllByRole('button');
    const togglePasswordBtn = toggleButtons[0];

    fireEvent.click(togglePasswordBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(togglePasswordBtn);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('deve mostrar/ocultar confirmar senha', () => {
    renderComponent();
    const confirmInput = screen.getByLabelText(/Confirme a Senha/i);
    const toggleButtons = screen.getAllByRole('button');
    const toggleConfirmBtn = toggleButtons[1];

    expect(confirmInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleConfirmBtn);
    expect(confirmInput).toHaveAttribute('type', 'text');
  });

  describe('Validações do Formulário', () => {
    it('deve exibir erros para campos vazios ou inválidos ao submeter', async () => {
      renderComponent();
      const submitBtn = screen.getByRole('button', { name: /Criar conta/i });
      
      fireEvent.click(submitBtn);

      const emailInput = screen.getByLabelText(/^Email/i);
      fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
      fireEvent.click(submitBtn);
      expect(screen.getByText(/E-mail inválido/i)).toBeInTheDocument();

      const passInput = screen.getByLabelText(/^Senha/i);
      fireEvent.change(passInput, { target: { value: '123' } });
      fireEvent.click(submitBtn);
      expect(screen.getByText(/A senha deve ter no mínimo 8 caracteres/i)).toBeInTheDocument();

      const confirmInput = screen.getByLabelText(/Confirme a Senha/i);
      fireEvent.change(passInput, { target: { value: '12345678' } });
      fireEvent.change(confirmInput, { target: { value: '87654321' } });
      fireEvent.click(submitBtn);
      expect(screen.getByText(/As senhas não coincidem/i)).toBeInTheDocument();

      const docInput = screen.getByLabelText(/CNPJ da Empresa/i);
      fireEvent.change(docInput, { target: { value: '123' } });
      fireEvent.click(submitBtn);
      expect(screen.getByText(/O documento deve ter 11 dígitos \(CPF\) ou 14 dígitos \(CNPJ\)/i)).toBeInTheDocument();
    });

    it('deve limpar o erro ao digitar no campo', async () => {
      renderComponent();
      const emailInput = screen.getByLabelText(/^Email/i);
      const submitBtn = screen.getByRole('button', { name: /Criar conta/i });

      fireEvent.change(emailInput, { target: { value: 'ruim' } });
      fireEvent.click(submitBtn);
      expect(screen.getByText(/E-mail inválido/i)).toBeInTheDocument();

      fireEvent.change(emailInput, { target: { value: 'bom@teste.com' } });
      
      expect(screen.queryByText(/E-mail inválido/i)).not.toBeInTheDocument();
    });

    it('deve validar documento obrigatório', async () => {
        renderComponent();
        fireEvent.change(screen.getByLabelText(/Primeiro Nome/i), { target: { value: 'Test' } });
        fireEvent.change(screen.getByLabelText(/Sobrenome/i), { target: { value: 'User' } });
        fireEvent.change(screen.getByLabelText(/^Email/i), { target: { value: 'valid@email.com' } });
        fireEvent.change(screen.getByLabelText(/^Senha/i), { target: { value: '12345678' } });
        fireEvent.change(screen.getByLabelText(/Confirme a Senha/i), { target: { value: '12345678' } });
        fireEvent.change(screen.getByLabelText(/Nome da Empresa/i), { target: { value: 'Empresa Teste' } });
        fireEvent.change(screen.getByLabelText(/Endereço da Empresa/i), { target: { value: 'Rua Teste' } });
        
        fireEvent.change(screen.getByLabelText(/CNPJ da Empresa/i), { target: { value: '' } });

        const submitBtn = screen.getByRole('button', { name: /Criar conta/i });
        fireEvent.click(submitBtn);

        expect(screen.getByText(/CNPJ é obrigatório/i)).toBeInTheDocument();
    });
  });

  describe('Integração com API', () => {
    it('deve enviar dados corretamente e navegar em caso de sucesso (Company Admin)', async () => {
      axios.post.mockResolvedValue({ data: { success: true } });
      renderComponent();

      fireEvent.change(screen.getByLabelText(/Primeiro Nome/i), { target: { value: 'João' } });
      fireEvent.change(screen.getByLabelText(/Sobrenome/i), { target: { value: 'Silva' } });
      fireEvent.change(screen.getByLabelText(/^Email/i), { target: { value: 'joao@empresa.com' } });
      fireEvent.change(screen.getByLabelText(/^Senha/i), { target: { value: 'senha1234' } });
      fireEvent.change(screen.getByLabelText(/Confirme a Senha/i), { target: { value: 'senha1234' } });
      
      fireEvent.change(screen.getByLabelText(/Nome da Empresa/i), { target: { value: 'Empresa Legal' } });
      fireEvent.change(screen.getByLabelText(/CNPJ da Empresa/i), { target: { value: '12345678000199' } }); // Vai mascarar
      fireEvent.change(screen.getByLabelText(/Endereço da Empresa/i), { target: { value: 'Rua das Flores' } });

      const submitBtn = screen.getByRole('button', { name: /Criar conta/i });
      fireEvent.click(submitBtn);

      expect(submitBtn).toBeDisabled();

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:3000/api/auth/register',
          expect.objectContaining({
            first_name: 'João',
            last_name: 'Silva',
            email: 'joao@empresa.com',
            role: 'company_admin',
            company_name: 'Empresa Legal',
            company_cnpj: '12.345.678/0001-99',
            company_address: 'Rua das Flores'
          })
        );
      });

      expect(mockNavigate).toHaveBeenCalledWith('/pending-approval', { replace: true });
    });

    it('deve enviar dados corretamente para Provider', async () => {
        axios.post.mockResolvedValue({ data: { success: true } });
        renderComponent();
  
        const roleSelect = screen.getByLabelText(/Tipo de Conta/i);
        fireEvent.mouseDown(roleSelect);
        fireEvent.click(await screen.findByText('Fornecedor (Academia)'));

        fireEvent.change(screen.getByLabelText(/Primeiro Nome/i), { target: { value: 'Maria' } });
        fireEvent.change(screen.getByLabelText(/Sobrenome/i), { target: { value: 'Souza' } });
        fireEvent.change(screen.getByLabelText(/^Email/i), { target: { value: 'maria@gym.com' } });
        fireEvent.change(screen.getByLabelText(/^Senha/i), { target: { value: 'senha1234' } });
        fireEvent.change(screen.getByLabelText(/Confirme a Senha/i), { target: { value: 'senha1234' } });

        fireEvent.change(screen.getByLabelText(/Nome do Fornecedor/i), { target: { value: 'Gym Fit' } });
        fireEvent.change(screen.getByLabelText(/Documento Federal/i), { target: { value: '12345678901' } }); // CPF
        fireEvent.change(screen.getByLabelText(/Endereço do Fornecedor/i), { target: { value: 'Av Paulista' } });

        fireEvent.click(screen.getByRole('button', { name: /Criar conta/i }));
  
        await waitFor(() => {
          expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/register'),
            expect.objectContaining({
              role: 'provider',
              provider_name: 'Gym Fit',
              provider_cnpj: '123.456.789-01',
            })
          );
        });
    });

    it('deve exibir mensagem de erro da API quando falhar', async () => {
      const errorMsg = 'Email já cadastrado';
      axios.post.mockRejectedValue({
        response: { data: { error: errorMsg } }
      });

      renderComponent();
      fireEvent.change(screen.getByLabelText(/Primeiro Nome/i), { target: { value: 'A' } });
      fireEvent.change(screen.getByLabelText(/Sobrenome/i), { target: { value: 'B' } });
      fireEvent.change(screen.getByLabelText(/^Email/i), { target: { value: 'valid@email.com' } });
      fireEvent.change(screen.getByLabelText(/^Senha/i), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText(/Confirme a Senha/i), { target: { value: '12345678' } });
      fireEvent.change(screen.getByLabelText(/Nome da Empresa/i), { target: { value: 'C' } });
      fireEvent.change(screen.getByLabelText(/CNPJ da Empresa/i), { target: { value: '12345678000199' } });
      fireEvent.change(screen.getByLabelText(/Endereço da Empresa/i), { target: { value: 'D' } });

      fireEvent.click(screen.getByRole('button', { name: /Criar conta/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(errorMsg);
      });
    });

    it('deve exibir erro genérico se a resposta da API não tiver detalhes', async () => {
        axios.post.mockRejectedValue(new Error('Network Error'));
        renderComponent();
        
        fireEvent.change(screen.getByLabelText(/Primeiro Nome/i), { target: { value: 'A' } });
        fireEvent.change(screen.getByLabelText(/Sobrenome/i), { target: { value: 'B' } });
        fireEvent.change(screen.getByLabelText(/^Email/i), { target: { value: 'valid@email.com' } });
        fireEvent.change(screen.getByLabelText(/^Senha/i), { target: { value: '12345678' } });
        fireEvent.change(screen.getByLabelText(/Confirme a Senha/i), { target: { value: '12345678' } });
        fireEvent.change(screen.getByLabelText(/Nome da Empresa/i), { target: { value: 'C' } });
        fireEvent.change(screen.getByLabelText(/CNPJ da Empresa/i), { target: { value: '12345678000199' } });
        fireEvent.change(screen.getByLabelText(/Endereço da Empresa/i), { target: { value: 'D' } });

        fireEvent.click(screen.getByRole('button', { name: /Criar conta/i }));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent(/Falha no registro/i);
        });
    });
  });
});