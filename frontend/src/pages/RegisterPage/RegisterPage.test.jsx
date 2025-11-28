import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './index'; // Ajuste o caminho se necessário

// 1. Mocks
vi.mock('axios');

// Mock do navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    // Link precisa ser mockado ou envolto em Router (usaremos MemoryRouter no render)
  };
});

// Mock do apiConfig
vi.mock('../../apiConfig', () => ({
  API_URL: 'http://localhost:3000'
}));

describe('RegisterPage Component', () => {
  // Helper para renderizar com Router
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
    
    // Campos comuns
    expect(screen.getByLabelText(/Primeiro Nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sobrenome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/i)).toBeInTheDocument(); // ^ para evitar conflito com helper text
    expect(screen.getByLabelText(/^Senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirme a Senha/i)).toBeInTheDocument();
    
    // Select de Role
    expect(screen.getByLabelText(/Tipo de Conta/i)).toBeInTheDocument();
    
    // Campos específicos de Company Admin (Padrão)
    expect(screen.getByLabelText(/Nome da Empresa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CNPJ da Empresa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Endereço da Empresa/i)).toBeInTheDocument();

    // Campos de Provider NÃO devem estar presentes
    expect(screen.queryByLabelText(/Nome do Fornecedor/i)).not.toBeInTheDocument();
  });

  it('deve alternar os campos ao mudar o Tipo de Conta para Fornecedor', async () => {
    renderComponent();

    // O Select do Material UI é um pouco chato. Primeiro clicamos no trigger (combobox)
    const roleSelect = screen.getByLabelText(/Tipo de Conta/i);
    fireEvent.mouseDown(roleSelect); // Abre o menu

    // Seleciona a opção de Fornecedor
    const providerOption = await screen.findByText('Fornecedor (Academia)');
    fireEvent.click(providerOption);

    // Verifica se os campos mudaram
    expect(screen.getByLabelText(/Nome do Fornecedor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Documento Federal \(CNPJ\/CPF\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Endereço do Fornecedor/i)).toBeInTheDocument();

    // Verifica se campos de empresa sumiram
    expect(screen.queryByLabelText(/Nome da Empresa/i)).not.toBeInTheDocument();
  });

  it('deve aplicar a máscara de CPF corretamente (<= 11 dígitos)', async () => {
    renderComponent();
    // Muda para provider para testar campo de documento genérico ou usa CNPJ da empresa
    // Vamos usar o CNPJ da empresa que já está na tela, mas testar a lógica de input curto (CPF)
    
    const docInput = screen.getByLabelText(/CNPJ da Empresa/i);
    
    // Digita 11 números (CPF)
    fireEvent.change(docInput, { target: { value: '12345678901' } });
    
    // Esperado: 123.456.789-01
    expect(docInput.value).toBe('123.456.789-01');
  });

  it('deve aplicar a máscara de CNPJ corretamente (> 11 dígitos)', async () => {
    renderComponent();
    const docInput = screen.getByLabelText(/CNPJ da Empresa/i);
    
    // Digita 14 números (CNPJ)
    fireEvent.change(docInput, { target: { value: '12345678000199' } });
    
    // Esperado: 12.345.678/0001-99
    expect(docInput.value).toBe('12.345.678/0001-99');
  });

  it('deve mostrar/ocultar senha ao clicar no ícone de olho', () => {
    renderComponent();
    const passwordInput = screen.getByLabelText(/^Senha/i);
    
    // Inicialmente type="password"
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Encontra o botão de toggle (geralmente o MUI coloca botões dentro do Adornment)
    const toggleButtons = screen.getAllByRole('button');
    // O primeiro botão de toggle deve ser o da senha, o segundo da confirmação
    // Vamos pegar pelo ícone SVG se possível, ou pela ordem.
    // Como há 2 campos de senha, há 2 botões de visibilidade.
    const togglePasswordBtn = toggleButtons[0]; // Assumindo ordem do DOM

    fireEvent.click(togglePasswordBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(togglePasswordBtn);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('deve mostrar/ocultar confirmar senha', () => {
    renderComponent();
    const confirmInput = screen.getByLabelText(/Confirme a Senha/i);
    const toggleButtons = screen.getAllByRole('button');
    const toggleConfirmBtn = toggleButtons[1]; // O segundo botão

    expect(confirmInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleConfirmBtn);
    expect(confirmInput).toHaveAttribute('type', 'text');
  });

  describe('Validações do Formulário', () => {
    it('deve exibir erros para campos vazios ou inválidos ao submeter', async () => {
      renderComponent();
      const submitBtn = screen.getByRole('button', { name: /Criar conta/i });

      // 1. Submeter vazio -> Erros de campos obrigatórios
      // Nota: campos HTML5 'required' podem impedir o clique dependendo do ambiente, 
      // mas o teste foca na função validateForm que roda no onSubmit.
      // Para testar a lógica JS, vamos preencher parcialmente errado.
      
      fireEvent.click(submitBtn);
      
      // O JS valida e seta erros. 
      // Testando validação de e-mail vazio/inválido
      const emailInput = screen.getByLabelText(/^Email/i);
      fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
      fireEvent.click(submitBtn);
      expect(screen.getByText(/E-mail inválido/i)).toBeInTheDocument();

      // Testando senha curta
      const passInput = screen.getByLabelText(/^Senha/i);
      fireEvent.change(passInput, { target: { value: '123' } });
      fireEvent.click(submitBtn);
      expect(screen.getByText(/A senha deve ter no mínimo 8 caracteres/i)).toBeInTheDocument();

      // Testando senhas diferentes
      const confirmInput = screen.getByLabelText(/Confirme a Senha/i);
      fireEvent.change(passInput, { target: { value: '12345678' } });
      fireEvent.change(confirmInput, { target: { value: '87654321' } });
      fireEvent.click(submitBtn);
      expect(screen.getByText(/As senhas não coincidem/i)).toBeInTheDocument();

      // Testando Documento vazio ou inválido
      const docInput = screen.getByLabelText(/CNPJ da Empresa/i);
      fireEvent.change(docInput, { target: { value: '123' } }); // Tamanho errado
      fireEvent.click(submitBtn);
      expect(screen.getByText(/O documento deve ter 11 dígitos \(CPF\) ou 14 dígitos \(CNPJ\)/i)).toBeInTheDocument();
    });

    it('deve limpar o erro ao digitar no campo', async () => {
      renderComponent();
      const emailInput = screen.getByLabelText(/^Email/i);
      const submitBtn = screen.getByRole('button', { name: /Criar conta/i });

      // Gera erro
      fireEvent.change(emailInput, { target: { value: 'ruim' } });
      fireEvent.click(submitBtn);
      expect(screen.getByText(/E-mail inválido/i)).toBeInTheDocument();

      // Digita novamente
      fireEvent.change(emailInput, { target: { value: 'bom@teste.com' } });
      
      // Erro deve sumir
      expect(screen.queryByText(/E-mail inválido/i)).not.toBeInTheDocument();
    });

    it('deve validar documento obrigatório', async () => {
        renderComponent();
        // Preenche tudo certo exceto documento
        fireEvent.change(screen.getByLabelText(/Primeiro Nome/i), { target: { value: 'Test' } });
        fireEvent.change(screen.getByLabelText(/Sobrenome/i), { target: { value: 'User' } });
        fireEvent.change(screen.getByLabelText(/^Email/i), { target: { value: 'valid@email.com' } });
        fireEvent.change(screen.getByLabelText(/^Senha/i), { target: { value: '12345678' } });
        fireEvent.change(screen.getByLabelText(/Confirme a Senha/i), { target: { value: '12345678' } });
        fireEvent.change(screen.getByLabelText(/Nome da Empresa/i), { target: { value: 'Empresa Teste' } });
        fireEvent.change(screen.getByLabelText(/Endereço da Empresa/i), { target: { value: 'Rua Teste' } });
        
        // Documento vazio
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

      // Preenche Formulário Completo
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

      // Verifica estado de loading
      // Nota: o loading pode ser muito rápido no teste, mas o botão deve mudar texto
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
            company_cnpj: '12.345.678/0001-99', // Verifica se foi mascarado
            company_address: 'Rua das Flores'
          })
        );
      });

      expect(mockNavigate).toHaveBeenCalledWith('/pending-approval', { replace: true });
    });

    it('deve enviar dados corretamente para Provider', async () => {
        axios.post.mockResolvedValue({ data: { success: true } });
        renderComponent();
  
        // Troca para Provider
        const roleSelect = screen.getByLabelText(/Tipo de Conta/i);
        fireEvent.mouseDown(roleSelect);
        fireEvent.click(await screen.findByText('Fornecedor (Academia)'));

        // Preenche dados
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
              provider_cnpj: '123.456.789-01', // CPF mascarado
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

      // Preenche o mínimo válido para passar da validação do frontend
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
        
        // Preenchimento rápido
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