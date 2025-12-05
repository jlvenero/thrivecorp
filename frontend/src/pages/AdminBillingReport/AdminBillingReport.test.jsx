import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import AdminBillingReport from './index';

// Mocks
vi.mock('axios');
vi.mock('../../apiConfig', () => ({ API_URL: 'http://localhost:3000' }));

// Mock do ConfirmationDialog
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
    const mockReport = [
        { company_id: 1, company_name: 'Empresa A', total_accesses: 10, total_cost: 200.50, billing_status: 'pending' },
        { company_id: 2, company_name: 'Empresa B', total_accesses: 5, total_cost: 100.00, billing_status: 'sent' }
    ];
    const mockCompanies = [
        { id: 1, name: 'Empresa A', status: 'active' },
        { id: 2, name: 'Empresa B', status: 'active' }
    ];

    beforeEach(() => {
        Storage.prototype.getItem = vi.fn(() => 'token');
        vi.clearAllMocks();
        // Setup padrão de mocks para evitar repetição
        axios.get.mockImplementation((url) => {
            if (url.includes('/companies')) return Promise.resolve({ data: mockCompanies });
            if (url.includes('/billing-report')) return Promise.resolve({ data: mockReport });
            return Promise.resolve({ data: [] });
        });
    });

    it('deve renderizar a tabela com dados', async () => {
        render(<AdminBillingReport />);
        
        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        expect(screen.getByText('Empresa A')).toBeInTheDocument();
        expect(screen.getByText('Faturado')).toBeInTheDocument();
        expect(screen.getByText('Pendente')).toBeInTheDocument();
    });


    it('deve abrir modal e atualizar status', async () => {
        axios.post.mockResolvedValue({}); // Sucesso no post

        render(<AdminBillingReport />);
        await waitFor(() => screen.getByText('Empresa A'));

        // Clica no botão de ação da primeira linha (Empresa A é pending -> ícone de check)
        const row = screen.getByText('Empresa A').closest('tr');
        const btn = within(row).getByRole('button'); 
        fireEvent.click(btn);

        // Confirma no modal mockado
        fireEvent.click(screen.getByText('CONFIRMAR_MOCK'));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/billing/status'),
                expect.objectContaining({ companyId: 1, status: 'sent' }),
                expect.anything()
            );
        });
    });

    it('deve exibir erro se a API falhar', async () => {
        // Sobrescreve o mock apenas para este teste
        axios.get.mockRejectedValue(new Error('Erro Fatal'));

        render(<AdminBillingReport />);

        await waitFor(() => {
            expect(screen.getByText(/Falha ao buscar o relatório/i)).toBeInTheDocument();
        });
    });
});