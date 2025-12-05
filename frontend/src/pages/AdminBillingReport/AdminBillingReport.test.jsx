import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import AdminBillingReport from './index';

vi.mock('axios');
vi.mock('../../apiConfig', () => ({ API_URL: 'http://localhost:3000' }));

// MOCK ROBUSTO DE URL (Window + Global)
const mockCreateObjectURL = vi.fn(() => 'mock-blob-url');
const mockRevokeObjectURL = vi.fn();

// Aplica o mock tanto no global quanto no window para garantir que o JSDOM pegue
Object.defineProperty(window, 'URL', {
  writable: true,
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
});
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

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
        // Limpa especificamente o mock da URL entre testes
        mockCreateObjectURL.mockClear();
        mockRevokeObjectURL.mockClear();

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

    it('deve filtrar por empresa', async () => {
        render(<AdminBillingReport />);
        await waitFor(() => screen.getByText('Empresa A'));

        // Pega o terceiro Select da tela (Mês[0], Ano[1], Empresa[2])
        const selects = screen.getAllByRole('combobox');
        const empresaSelect = selects[2]; 
        
        fireEvent.mouseDown(empresaSelect);
        
        const optionB = await screen.findByRole('option', { name: 'Empresa B' });
        fireEvent.click(optionB);

        // Verifica elementos filtrados
        const empresaBTexts = screen.getAllByText('Empresa B');
        expect(empresaBTexts.length).toBeGreaterThanOrEqual(1);

        // Verifica que Empresa A sumiu da tabela
        expect(screen.queryByRole('cell', { name: 'Empresa A' })).not.toBeInTheDocument();
        expect(screen.getByText(/TOTAL \(1 empresa\)/)).toBeInTheDocument();
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

    it('deve gerar e baixar o CSV ao clicar em Exportar', async () => {
        render(<AdminBillingReport />);
        await waitFor(() => screen.getByText('Empresa A'));

        // Mock para o elemento 'a' criado dinamicamente
        const linkSpy = { 
            click: vi.fn(), 
            setAttribute: vi.fn(), 
            style: {},
            download: '' // Propriedade necessária para o teste de feature detection
        };
        
        // Salva a função original para não quebrar outros createElement
        const originalCreateElement = document.createElement.bind(document);
        
        // Espiona a criação do elemento
        const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
            if (tagName === 'a') return linkSpy;
            return originalCreateElement(tagName); 
        });
        
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

        const exportBtn = screen.getByText('Exportar CSV');
        
        // Garante que o botão está habilitado antes de clicar
        expect(exportBtn).not.toBeDisabled();
        
        fireEvent.click(exportBtn);

        expect(mockCreateObjectURL).toHaveBeenCalled();
        expect(linkSpy.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('relatorio-faturamento'));
        expect(linkSpy.click).toHaveBeenCalled();
        expect(mockRevokeObjectURL).toHaveBeenCalled();
        
        createElementSpy.mockRestore();
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

    it('deve recarregar o relatório ao mudar o ano', async () => {
        render(<AdminBillingReport />);
        await waitFor(() => screen.getByText('Empresa A'));

        axios.get.mockClear();
        axios.get.mockResolvedValue({ data: mockReport });

        const selects = screen.getAllByRole('combobox');
        const yearSelect = selects[1]; 

        fireEvent.mouseDown(yearSelect);
        
        const yearOption = await screen.findByRole('option', { name: (new Date().getFullYear() - 1).toString() });
        fireEvent.click(yearOption);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('/billing-report'),
                expect.objectContaining({
                    params: expect.objectContaining({ year: new Date().getFullYear() - 1 })
                })
            );
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