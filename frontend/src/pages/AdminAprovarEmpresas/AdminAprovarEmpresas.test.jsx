import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import AdminAprovarEmpresas from './index';

vi.mock('axios');

vi.mock('../../apiConfig', () => ({
  API_URL: 'http://localhost:3000'
}));

vi.mock('../../components/ConfirmationDialog', () => ({
  default: ({ open, title, message, onConfirm, onClose }) => {
    if (!open) return null;
    return (
      <div data-testid="mock-dialog">
        <h1>{title}</h1>
        <p>{message}</p>
        <button onClick={onConfirm}>CONFIRMAR_MOCK</button>
        <button onClick={onClose}>CANCELAR_MOCK</button>
      </div>
    );
  }
}));

describe('AdminAprovarEmpresas Component', () => {
  const mockToken = 'fake-jwt-token';
  
  const mockCompanies = [
    { id: 1, name: 'Empresa Alpha', cnpj: '11.111.111/0001-11', status: 'pending' },
    { id: 2, name: 'Empresa Beta', cnpj: '22.222.222/0001-22', status: 'active' },
    { id: 3, name: 'Empresa Gama', cnpj: '33.333.333/0001-33', status: 'pending' }
  ];

  beforeEach(() => {
    Storage.prototype.getItem = vi.fn(() => mockToken);
    vi.clearAllMocks();
  });

  it('deve exibir o estado de loading inicialmente', () => {
    axios.get.mockReturnValue(new Promise(() => {}));
    
    render(<AdminAprovarEmpresas />);
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('deve buscar e renderizar a lista de empresas corretamente', async () => {
    axios.get.mockResolvedValueOnce({ data: mockCompanies });

    render(<AdminAprovarEmpresas />);

    await waitFor(() => {
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Empresa Alpha')).toBeInTheDocument();
    expect(screen.getByText('Empresa Beta')).toBeInTheDocument();
    expect(screen.getByText('11.111.111/0001-11')).toBeInTheDocument();
    
    expect(axios.get).toHaveBeenCalledWith('http://localhost:3000/api/companies', {
    headers: { Authorization: `Bearer ${mockToken}` }
    });

    expect(screen.getByText(/Mostrando 3 de 3 empresas/i)).toBeInTheDocument();
    expect(screen.getByText('Pendente: 2')).toBeInTheDocument();
    expect(screen.getByText('Aprovado: 1')).toBeInTheDocument();
  });

  it('deve filtrar a lista ao digitar no campo de busca', async () => {
    axios.get.mockResolvedValueOnce({ data: mockCompanies });
    render(<AdminAprovarEmpresas />);

    await waitFor(() => screen.getByText('Empresa Alpha'));

    const searchInput = screen.getByPlaceholderText('Buscar por nome ou CNPJ...');
    
    fireEvent.change(searchInput, { target: { value: 'Beta' } });

    expect(screen.getByText('Empresa Beta')).toBeInTheDocument();
    expect(screen.queryByText('Empresa Alpha')).not.toBeInTheDocument();
    
    expect(screen.getByText(/Mostrando 1 de 3 empresas/i)).toBeInTheDocument();
  });

  it('deve abrir o modal e aprovar uma empresa com sucesso', async () => {
    axios.get.mockResolvedValue({ data: mockCompanies });
    axios.put.mockResolvedValue({});

    render(<AdminAprovarEmpresas />);
    await waitFor(() => screen.getByText('Empresa Alpha'));

    const row = screen.getByText('Empresa Alpha').closest('tr');
    
    const approveButton = within(row).getByTestId('CheckCircleOutlineIcon').closest('button');
    fireEvent.click(approveButton);

    expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirmar Aprovação')).toBeInTheDocument();

    fireEvent.click(screen.getByText('CONFIRMAR_MOCK'));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:3000/api/companies/1/approve',
        {},
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
    });

    expect(axios.get).toHaveBeenCalledTimes(2); 
  });

  it('deve abrir o modal e rejeitar uma empresa', async () => {
    axios.get.mockResolvedValue({ data: mockCompanies });
    axios.delete.mockResolvedValue({});

    render(<AdminAprovarEmpresas />);
    await waitFor(() => screen.getByText('Empresa Gama'));

    const row = screen.getByText('Empresa Gama').closest('tr');
    
    const rejectButton = within(row).getByTestId('HighlightOffIcon').closest('button');
    fireEvent.click(rejectButton);

    expect(screen.getByText('Confirmar Rejeição')).toBeInTheDocument();

    fireEvent.click(screen.getByText('CONFIRMAR_MOCK'));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:3000/api/companies/3',
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
    });
  });

  it('deve permitir excluir qualquer empresa (mesmo as aprovadas)', async () => {
    axios.get.mockResolvedValue({ data: mockCompanies });
    axios.delete.mockResolvedValue({});

    render(<AdminAprovarEmpresas />);
    await waitFor(() => screen.getByText('Empresa Beta'));

    const row = screen.getByText('Empresa Beta').closest('tr');
    
    expect(within(row).queryByTestId('CheckCircleOutlineIcon')).not.toBeInTheDocument();
    
    const deleteButton = within(row).getByTestId('DeleteOutlineIcon').closest('button');
    fireEvent.click(deleteButton);

    expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('CONFIRMAR_MOCK'));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:3000/api/companies/2',
        expect.anything()
      );
    });
  });

  it('deve exibir mensagem de erro se a busca falhar', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));

    render(<AdminAprovarEmpresas />);

    await waitFor(() => {
      expect(screen.getByText('Falha ao buscar as empresas.')).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem de erro se a aprovação falhar', async () => {
    axios.get.mockResolvedValue({ data: mockCompanies });
    axios.put.mockRejectedValue(new Error('Erro no servidor'));

    render(<AdminAprovarEmpresas />);
    await waitFor(() => screen.getByText('Empresa Alpha'));

    const row = screen.getByText('Empresa Alpha').closest('tr');
    const approveButton = within(row).getByTestId('CheckCircleOutlineIcon').closest('button');
    fireEvent.click(approveButton);
    fireEvent.click(screen.getByText('CONFIRMAR_MOCK'));

    await waitFor(() => {
      expect(screen.getByText('Falha ao aprovar a empresa.')).toBeInTheDocument();
    });
  });
});