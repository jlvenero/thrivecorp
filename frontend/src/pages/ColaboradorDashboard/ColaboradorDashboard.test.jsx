import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import ColaboradorDashboard from './index';

// 1. Mock do Axios
vi.mock('axios');

// 2. Mock do componente ConfirmationDialog
// Isso é essencial para que o teste não quebre tentando renderizar o Dialog real
vi.mock('../../components/ConfirmationDialog', () => ({
  __esModule: true,
  default: ({ open, title, message, onConfirm, onClose }) => {
    if (!open) return null;
    return (
      <div data-testid="mock-dialog">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onConfirm}>Confirmar Mock</button>
        <button onClick={onClose}>Cancelar Mock</button>
      </div>
    );
  }
}));

// 3. Mock da configuração da API
vi.mock('../../apiConfig', () => ({
  API_URL: 'http://api-test'
}));

describe('ColaboradorDashboard Component', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'fake-jwt-token');
  });

  const mockGyms = [
    { id: 1, name: 'Iron Gym', address: 'Rua do Ferro, 123', status: 'active' },
    { id: 2, name: 'Yoga Life', address: 'Av. Paz, 456', status: 'active' }
  ];

  it('deve exibir o loading inicialmente e depois a lista de academias', async () => {
    // Mock da resposta de sucesso
    axios.get.mockResolvedValue({ data: mockGyms });

    render(<ColaboradorDashboard />);

    // Verifica se o loading (CircularProgress) aparece
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Aguarda a lista ser renderizada
    await waitFor(() => {
      expect(screen.getByText('Iron Gym')).toBeInTheDocument();
      expect(screen.getByText('Rua do Ferro, 123')).toBeInTheDocument();
      expect(screen.getByText('Yoga Life')).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem quando não houver academias disponíveis', async () => {
    // Mock de lista vazia
    axios.get.mockResolvedValue({ data: [] });

    render(<ColaboradorDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma academia disponível/i)).toBeInTheDocument();
    });
  });

  it('deve exibir erro se falhar ao buscar academias', async () => {
    // Mock de erro na requisição GET
    axios.get.mockRejectedValue(new Error('Erro de rede'));

    render(<ColaboradorDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Falha ao buscar as academias disponíveis/i)).toBeInTheDocument();
    });
  });

  it('deve realizar o fluxo de check-in com sucesso', async () => {
    axios.get.mockResolvedValue({ data: mockGyms });
    axios.post.mockResolvedValue({ data: { success: true } });

    render(<ColaboradorDashboard />);

    // 1. Espera carregar e encontra o botão da primeira academia
    const btnCheckin = await screen.findAllByText(/Fazer Check-in/i);
    fireEvent.click(btnCheckin[0]);

    // 2. Verifica se o Dialog Mockado abriu
    expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();
    expect(screen.getByText(/Você confirma o check-in na academia "Iron Gym"?/i)).toBeInTheDocument();

    // 3. Clica em confirmar no Dialog
    fireEvent.click(screen.getByText('Confirmar Mock'));

    // 4. Verifica a chamada POST
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/accesses'),
        { gymId: 1 },
        expect.objectContaining({
          headers: { Authorization: 'Bearer fake-jwt-token' }
        })
      );
    });

    // 5. Verifica mensagem de sucesso na tela
    expect(await screen.findByText(/Check-in em "Iron Gym" realizado com sucesso!/i)).toBeInTheDocument();
  });

  it('deve exibir erro se o check-in falhar', async () => {
    axios.get.mockResolvedValue({ data: mockGyms });
    // Mock de erro no POST (ex: limite atingido)
    axios.post.mockRejectedValue({
      response: { data: { error: 'Limite de check-ins diário atingido.' } }
    });

    render(<ColaboradorDashboard />);

    // Abre o modal e confirma
    const btnCheckin = await screen.findAllByText(/Fazer Check-in/i);
    fireEvent.click(btnCheckin[0]);
    fireEvent.click(screen.getByText('Confirmar Mock'));

    // Verifica a mensagem de erro específica
    expect(await screen.findByText('Limite de check-ins diário atingido.')).toBeInTheDocument();
  });
});