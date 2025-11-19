import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import axios from 'axios';
import LoginPage from './index';
import { API_URL } from '../../apiConfig';

vi.mock('axios');

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

describe('LoginPage', () => {

    afterEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    const renderComponent = () => {
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );
    };

    it('deve renderizar os campos de email e senha', () => {
        renderComponent();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
    });

    it('deve realizar login com sucesso e redirecionar', async () => {
        axios.post.mockResolvedValue({
            data: {
                token: 'fake-token-123',
                user: { role: 'thrive_admin' }
            }
        });

        renderComponent();

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'admin@teste.com' } });
        fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'senha123' } });
        
        fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(`${API_URL}/api/auth/login`, {
                email: 'admin@teste.com',
                password: 'senha123'
            });
        });

        expect(localStorage.getItem('token')).toBe('fake-token-123');
        
        expect(mockedNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });

    it('deve exibir mensagem de erro genérica se o login falhar (500)', async () => {
        axios.post.mockRejectedValue(new Error('Erro de rede'));

        renderComponent();

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'teste@teste.com' } });
        fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: '123' } });
        fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent('Falha no login. Verifique sua conexão e tente novamente.');
    });

    it('deve exibir mensagem específica de conta pendente (403)', async () => {
        const erroBackend = {
            response: {
                data: {
                    error: 'Sua conta ainda está em análise. Aguarde a aprovação do administrador.'
                }
            }
        };
        axios.post.mockRejectedValue(erroBackend);

        renderComponent();

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'pendente@teste.com' } });
        fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: '123' } });
        fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent('Sua conta ainda está em análise. Aguarde a aprovação do administrador.');
    });
});