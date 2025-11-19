import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import axios from 'axios';
import CompanyAdminDashboard from './index';
import { API_URL } from '../../apiConfig';

vi.mock('axios');

const mockCollaborators = [
    { id: 1, first_name: 'João', last_name: 'Silva', email: 'joao@empresa.com', status: 'active' },
    { id: 2, first_name: 'Maria', last_name: 'Souza', email: 'maria@empresa.com', status: 'active' }
];

const mockAccessReport = [
    { id: 100, access_timestamp: '2023-10-27T10:00:00Z', first_name: 'João', last_name: 'Silva', gym_name: 'Academia Top', price_per_access: 25.00 }
];

describe('CompanyAdminDashboard', () => {

    afterEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = () => {
        render(<CompanyAdminDashboard />);
    };

    const setupDataMocks = () => {
        axios.get.mockImplementation((url) => {
            if (url.includes('/company/collaborators')) return Promise.resolve({ data: mockCollaborators });
            if (url.includes('/accesses/company-details-report')) return Promise.resolve({ data: mockAccessReport });
            return Promise.resolve({ data: [] });
        });
    };

    it('deve renderizar a lista de colaboradores e o relatório de acessos', async () => {
        setupDataMocks();
        renderComponent();

        const joaoElements = await screen.findAllByText('João Silva');
        expect(joaoElements.length).toBeGreaterThanOrEqual(1);

        expect(screen.getByText('Maria Souza')).toBeInTheDocument();
        expect(screen.getByText('Academia Top')).toBeInTheDocument();
        expect(screen.getByText('R$ 25.00')).toBeInTheDocument();
    });

    it('deve abrir o modal e adicionar um novo colaborador', async () => {
        axios.get.mockResolvedValue({ data: [] }); 
        axios.post.mockResolvedValue({ data: { message: 'Criado' } });

        renderComponent();

        const addButton = screen.getByLabelText('add-collaborator');
        fireEvent.click(addButton);

        expect(screen.getByRole('heading', { name: /Adicionar Novo Colaborador/i })).toBeInTheDocument();

        fireEvent.change(screen.getByRole('textbox', { name: /Primeiro Nome/i }), { target: { value: 'Novo' } });
        fireEvent.change(screen.getByRole('textbox', { name: /Sobrenome/i }), { target: { value: 'User' } });
        fireEvent.change(screen.getByRole('textbox', { name: /Email/i }), { target: { value: 'novo@teste.com' } });
        
        const passwordInput = screen.getByLabelText(/Senha/i);
        fireEvent.change(passwordInput, { target: { value: '123456' } });

        const submitButton = screen.getByRole('button', { name: /^Adicionar Colaborador$/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/company/collaborators'),
                expect.objectContaining({ email: 'novo@teste.com' }),
                expect.anything()
            );
        });
    });

    it('deve abrir o Dialog de confirmação e desativar um colaborador', async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes('/collaborators')) return Promise.resolve({ data: [mockCollaborators[0]] });
            return Promise.resolve({ data: [] });
        });
        axios.put.mockResolvedValue({ data: {} });

        renderComponent();

        await screen.findByText('João Silva');

        const deleteButtons = screen.getAllByLabelText('deactivate');
        fireEvent.click(deleteButtons[0]);

        expect(screen.getByText('Desativar Colaborador')).toBeInTheDocument();

        const confirmButton = screen.getByRole('button', { name: 'Confirmar' });
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                expect.stringContaining('/deactivate'),
                {},
                expect.anything()
            );
        });
    });
});