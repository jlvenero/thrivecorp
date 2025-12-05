import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import AdminBillingReport from './index';

vi.mock('axios');
vi.mock('../../apiConfig', () => ({ API_URL: 'http://localhost:3000' }));

global.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
global.URL.revokeObjectURL = vi.fn();

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

describe('AdminBillingReport Component', () => {
    const mockToken = 'fake-admin-token';
    const mockReport = [
        { company_id: 1, company_name: 'Empresa A', total_accesses: 10, total_cost: 200.50, billing_status: 'pending' },
        { company_id: 2, company_name: 'Empresa B', total_accesses: 5, total_cost: 100.00, billing_status: 'sent' }
    ];
    const mockCompanies = [
        { id: 1, name: 'Empresa A', status: 'active' },
        { id: 2, name: 'Empresa B', status: 'active' }
    ];

    beforeEach(() => {
        Storage.prototype.getItem = vi.fn(() => mockToken);
        vi.clearAllMocks();
        axios.get.mockImplementation((url) => {
            if (url.includes('/companies')) return Promise.resolve({ data: mockCompanies });
            if (url.includes('/billing-report')) return Promise.resolve({ data: mockReport });
            return Promise.resolve({ data: [] });
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('deve renderizar carregando inicialmente', () => {
        axios.get.mockImplementation(() => new Promise(() => {}));
        render(<AdminBillingReport />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('deve buscar e exibir os dados do relatório', async () => {
        render(<AdminBillingReport />);

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        expect(screen.getByText('Empresa A')).toBeInTheDocument();
        expect(screen.getByText('Empresa B')).toBeInTheDocument();
        expect(screen.getByText('R$ 200.50')).toBeInTheDocument();
        expect(screen.getByText('Faturado')).toBeInTheDocument();
        expect(screen.getByText('Pendente')).toBeInTheDocument();
    });

    it('deve abrir modal e atualizar status ao confirmar', async () => {
        axios.post.mockResolvedValue({});

        render(<AdminBillingReport />);
        await waitFor(() => screen.getByText('Empresa A'));

        const row = screen.getByText('Empresa A').closest('tr');
        const actionButton = within(row).getByRole('button');
        fireEvent.click(actionButton);

        expect(screen.getByText('Confirmar Faturamento')).toBeInTheDocument();

        fireEvent.click(screen.getByText('CONFIRMAR_MOCK'));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/billing/status'),
                expect.objectContaining({ 
                    companyId: 1, 
                    status: 'sent' 
                }),
                expect.anything()
            );
        });
    });

    it('deve exibir erro ao tentar exportar sem dados', async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes('/billing-report')) return Promise.resolve({ data: [] });
            return Promise.resolve({ data: [] });
        });

        render(<AdminBillingReport />);
        await waitFor(() => screen.queryByRole('progressbar'));

        const exportBtn = screen.getByText('Exportar CSV');
        expect(exportBtn).toBeDisabled();
    });

    it('deve lidar com erro ao buscar relatório', async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes('/companies')) return Promise.resolve({ data: [] });
            return Promise.reject(new Error('Erro API'));
        });

        render(<AdminBillingReport />);

        await waitFor(() => {
            expect(screen.getByText('Falha ao buscar o relatório de faturamento.')).toBeInTheDocument();
        });
    });

    it('deve exibir erro se falhar ao atualizar o status', async () => {
        axios.post.mockRejectedValue({ response: { data: { error: 'Erro ao atualizar' } } });

        render(<AdminBillingReport />);
        await waitFor(() => screen.getByText('Empresa A'));

        const row = screen.getByText('Empresa A').closest('tr');
        const btn = within(row).getByRole('button'); 
        fireEvent.click(btn);

        fireEvent.click(screen.getByText('CONFIRMAR_MOCK'));

        await waitFor(() => {
            expect(screen.getByText('Erro ao atualizar')).toBeInTheDocument();
        });
    });

    it('deve logar erro no console se falhar ao buscar empresas', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        axios.get.mockImplementation((url) => {
            if (url.includes('/companies')) return Promise.reject(new Error('Erro Empresas'));
            if (url.includes('/billing-report')) return Promise.resolve({ data: mockReport });
            return Promise.resolve({ data: [] });
        });

        render(<AdminBillingReport />);
        
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                "Falha ao buscar empresas para o filtro:", 
                expect.any(Error)
            );
        });
        
        consoleSpy.mockRestore();
    });
});