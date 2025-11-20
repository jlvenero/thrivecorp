import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Para simular rotas
import { describe, it, expect, vi, afterEach } from 'vitest';
import axios from 'axios';
import RegisterPage from './index';
import { API_URL } from '../../apiConfig';

// Mocks
vi.mock('axios');
const mockedNavigate = vi.fn();

// Mock do react-router-dom para interceptar o useNavigate
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

describe('RegisterPage', () => {
    
    afterEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = () => {
        render(
            <MemoryRouter>
                <RegisterPage />
            </MemoryRouter>
        );
    };

    it('deve renderizar os campos iniciais corretamente', () => {
        renderComponent();
        expect(screen.getByRole('heading', { name: /ThriveCorp/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Primeiro Nome/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Criar conta/i })).toBeInTheDocument();
    });

    it('deve validar senhas que não coincidem', async () => {
        renderComponent();

        // Preenche dados mínimos para focar na senha
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'teste@email.com' } });
        fireEvent.change(screen.getByLabelText(/^Senha/i), { target: { value: 'senha123' } });
        fireEvent.change(screen.getByLabelText(/Confirme a Senha/i), { target: { value: 'senha456' } });

        fireEvent.click(screen.getByRole('button', { name: /Criar conta/i }));

        // Espera mensagem de erro
        expect(await screen.findByText('As senhas não coincidem.')).toBeInTheDocument();
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('deve aplicar a máscara de CNPJ corretamente', () => {
        renderComponent();

        // Seleciona o campo de CNPJ (assumindo que Company Admin é o padrão)
        const cnpjInput = screen.getByLabelText(/CNPJ da Empresa/i);

        // Simula digitar apenas números
        fireEvent.change(cnpjInput, { target: { value: '12345678000199' } });

        // Verifica se a formatação foi aplicada
        expect(cnpjInput.value).toBe('12.345.678/0001-99');
    });

    it('deve enviar o formulário com sucesso e navegar para aprovação pendente', async () => {
        // Arrange: Prepara o mock do axios para sucesso
        axios.post.mockResolvedValue({ data: { message: 'Sucesso' } });

        renderComponent();

        // Act: Preenche o formulário completo
        fireEvent.change(screen.getByLabelText(/Primeiro Nome/i), { target: { value: 'Maria' } });
        fireEvent.change(screen.getByLabelText(/Sobrenome/i), { target: { value: 'Souza' } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'maria@empresa.com' } });
        
        const senha = 'minhasenha123';
        fireEvent.change(screen.getByLabelText(/^Senha/i), { target: { value: senha } });
        fireEvent.change(screen.getByLabelText(/Confirme a Senha/i), { target: { value: senha } });

        // Dados da empresa
        fireEvent.change(screen.getByLabelText(/Nome da Empresa/i), { target: { value: 'Tech Solutions' } });
        fireEvent.change(screen.getByLabelText(/CNPJ da Empresa/i), { target: { value: '12345678000199' } }); // Máscara entra aqui
        fireEvent.change(screen.getByLabelText(/Endereço da Empresa/i), { target: { value: 'Rua A, 100' } });

        // Submete
        const btn = screen.getByRole('button', { name: /Criar conta/i });
        fireEvent.click(btn);

        // Assert
        // Verifica se o botão mudou para "Criando conta..."
        expect(await screen.findByText('Criando conta...')).toBeInTheDocument();

        await waitFor(() => {
            // Verifica a chamada do Axios
            expect(axios.post).toHaveBeenCalledWith(
                `${API_URL}/api/auth/register`,
                expect.objectContaining({
                    first_name: 'Maria',
                    email: 'maria@empresa.com',
                    company_cnpj: '12.345.678/0001-99', // Verifica se foi enviado formatado (conforme seu código atual)
                    role: 'company_admin'
                })
            );
            // Verifica o redirecionamento
            expect(mockedNavigate).toHaveBeenCalledWith('/pending-approval', { replace: true });
        });
    });

    it('deve exibir erro da API se o registro falhar', async () => {
        // Arrange: Simula erro 400 do backend
        axios.post.mockRejectedValue({
            response: { data: { error: 'E-mail já cadastrado.' } }
        });

        renderComponent();

        // Preenche apenas o necessário para passar na validação local
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'duplicado@teste.com' } });
        fireEvent.change(screen.getByLabelText(/^Senha/i), { target: { value: '12345678' } });
        fireEvent.change(screen.getByLabelText(/Confirme a Senha/i), { target: { value: '12345678' } });
        fireEvent.change(screen.getByLabelText(/CNPJ da Empresa/i), { target: { value: '12345678000199' } });

        fireEvent.click(screen.getByRole('button', { name: /Criar conta/i }));

        // Assert
        expect(await screen.findByText('E-mail já cadastrado.')).toBeInTheDocument();
    });
});