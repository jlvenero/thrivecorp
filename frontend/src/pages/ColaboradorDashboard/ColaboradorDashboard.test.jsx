import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import ColaboradorDashboard from './index';

vi.mock('axios');

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
    axios.get.mockResolvedValue({ data: mockGyms });

    render(<ColaboradorDashboard />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Iron Gym')).toBeInTheDocument();
      expect(screen.getByText('Rua do Ferro, 123')).toBeInTheDocument();
      expect(screen.getByText('Yoga Life')).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem quando não houver academias disponíveis', async () => {
    axios.get.mockResolvedValue({ data: [] });

    render(<ColaboradorDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma academia disponível/i)).toBeInTheDocument();
    });
  });

  it('deve exibir erro se falhar ao buscar academias', async () => {
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

    const btnCheckin = await screen.findAllByText(/Fazer Check-in/i);
    fireEvent.click(btnCheckin[0]);

    expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();
    expect(screen.getByText(/Você confirma o check-in na academia "Iron Gym"?/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Confirmar Mock'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/accesses'),
        { gymId: 1 },
        expect.objectContaining({
          headers: { Authorization: 'Bearer fake-jwt-token' }
        })
      );
    });

    expect(await screen.findByText(/Check-in em "Iron Gym" realizado com sucesso!/i)).toBeInTheDocument();
  });

  it('deve exibir erro se o check-in falhar', async () => {
    axios.get.mockResolvedValue({ data: mockGyms });
    axios.post.mockRejectedValue({
      response: { data: { error: 'Limite de check-ins diário atingido.' } }
    });

    render(<ColaboradorDashboard />);

    const btnCheckin = await screen.findAllByText(/Fazer Check-in/i);
    fireEvent.click(btnCheckin[0]);
    fireEvent.click(screen.getByText('Confirmar Mock'));

    expect(await screen.findByText('Limite de check-ins diário atingido.')).toBeInTheDocument();
  });
});