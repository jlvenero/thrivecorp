import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import AdminAprovarAcademias from './index';

vi.mock('axios');

vi.mock('../../apiConfig', () => ({
  API_URL: 'http://localhost:3000'
}));

vi.mock('../../components/ConfirmationDialog', () => ({
  default: ({ open, title, onConfirm }) => {
    if (!open) return null;
    return (
      <div data-testid="mock-dialog">
        <p>{title}</p>
        <button onClick={onConfirm}>CONFIRMAR_MOCK</button>
      </div>
    );
  }
}));

describe('AdminAprovarAcademias Component', () => {
  const mockToken = 'fake-admin-token';
  
  const mockGyms = [
    { id: 1, name: 'Academia Power', address: 'Rua A, 123', status: 'pending' },
    { id: 2, name: 'Studio Zen', address: 'Av. Central, 500', status: 'active' },
    { id: 3, name: 'CrossFit Iron', address: 'Rua B, 99', status: 'pending' }
  ];

  beforeEach(() => {
    Storage.prototype.getItem = vi.fn(() => mockToken);
    vi.clearAllMocks();
  });

  it('deve exibir o estado de loading inicialmente', () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    render(<AdminAprovarAcademias />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('deve buscar e renderizar a lista de academias corretamente', async () => {
    axios.get.mockResolvedValueOnce({ data: mockGyms });

    render(<AdminAprovarAcademias />);

    await waitFor(() => {
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Academia Power')).toBeInTheDocument();
    expect(screen.getByText('Rua A, 123')).toBeInTheDocument();
    expect(screen.getByText('Studio Zen')).toBeInTheDocument();
    
    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:3000/api/gyms/all',
      { headers: { Authorization: `Bearer ${mockToken}` } }
    );

    expect(screen.getByText(/Mostrando 3 de 3 academias/i)).toBeInTheDocument();
    expect(screen.getByText('Pendente: 2')).toBeInTheDocument();
    expect(screen.getByText('Aprovado: 1')).toBeInTheDocument();
  });

  it('deve filtrar por nome ou endereço', async () => {
    axios.get.mockResolvedValueOnce({ data: mockGyms });
    render(<AdminAprovarAcademias />);

    await waitFor(() => screen.getByText('Academia Power'));

    const searchInput = screen.getByPlaceholderText('Buscar por nome ou endereço...');

    fireEvent.change(searchInput, { target: { value: 'Av. Central' } });

    expect(screen.getByText('Studio Zen')).toBeInTheDocument();
    expect(screen.queryByText('Academia Power')).not.toBeInTheDocument();

    expect(screen.getByText(/Mostrando 1 de 3 academias/i)).toBeInTheDocument();
  });

  it('deve abrir modal e aprovar uma academia pendente', async () => {
    axios.get.mockResolvedValue({ data: mockGyms });
    axios.put.mockResolvedValueOnce({});

    render(<AdminAprovarAcademias />);
    await waitFor(() => screen.getByText('Academia Power'));

    const row = screen.getByText('Academia Power').closest('tr');
    
    const approveBtn = within(row).getByTestId('CheckCircleOutlineIcon').closest('button');
    fireEvent.click(approveBtn);

    expect(screen.getByText('Confirmar Aprovação')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('CONFIRMAR_MOCK'));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:3000/api/gyms/1/approve',
        {},
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
    });

    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('deve abrir modal e reprovar uma academia pendente', async () => {
    axios.get.mockResolvedValue({ data: mockGyms });
    axios.delete.mockResolvedValueOnce({});

    render(<AdminAprovarAcademias />);
    await waitFor(() => screen.getByText('CrossFit Iron'));

    const row = screen.getByText('CrossFit Iron').closest('tr');

    const reproveBtn = within(row).getByTestId('HighlightOffIcon').closest('button');
    fireEvent.click(reproveBtn);

    expect(screen.getByText('Confirmar Reprovação')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('CONFIRMAR_MOCK'));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:3000/api/gyms/3/reprove',
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
    });
  });

  it('não deve exibir botões de ação para academias já aprovadas (active)', async () => {
    axios.get.mockResolvedValueOnce({ data: mockGyms });
    render(<AdminAprovarAcademias />);
    
    await waitFor(() => screen.getByText('Studio Zen'));

    const row = screen.getByText('Studio Zen').closest('tr');
    
    expect(within(row).queryByTestId('CheckCircleOutlineIcon')).not.toBeInTheDocument();
    expect(within(row).queryByTestId('HighlightOffIcon')).not.toBeInTheDocument();
  });

  it('deve exibir erro se a busca falhar', async () => {
    axios.get.mockRejectedValue(new Error('Erro API'));
    render(<AdminAprovarAcademias />);

    await waitFor(() => {
      expect(screen.getByText('Falha ao buscar as academias.')).toBeInTheDocument();
    });
  });

  it('deve exibir erro se a aprovação falhar', async () => {
    axios.get.mockResolvedValue({ data: mockGyms });
    axios.put.mockRejectedValue(new Error('Erro Update'));

    render(<AdminAprovarAcademias />);
    await waitFor(() => screen.getByText('Academia Power'));

    const row = screen.getByText('Academia Power').closest('tr');
    const approveBtn = within(row).getByTestId('CheckCircleOutlineIcon').closest('button');
    
    fireEvent.click(approveBtn);
    fireEvent.click(screen.getByText('CONFIRMAR_MOCK'));

    await waitFor(() => {
      expect(screen.getByText('Falha ao aprovar a academia.')).toBeInTheDocument();
    });
  });
});