import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import axios from 'axios';
import ProviderDashboard from './index';

vi.mock('axios');

const mockGyms = [
    { id: 10, name: 'Gym A', address: 'Rua A', status: 'active' },
    { id: 20, name: 'Gym B', address: 'Rua B', status: 'active' }
];

const mockPlans = [
    { id: 1, gym_id: 10, name: 'Plano Gold', description: 'Tudo incluso', price_per_access: 50.00 }
];

describe('ProviderDashboard', () => {

    afterEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = () => {
        render(<ProviderDashboard />);
    };

    const setupMocks = () => {
        axios.get.mockImplementation((url) => {
            if (url.includes('/api/gyms')) return Promise.resolve({ data: mockGyms });
            if (url.includes('/plans')) return Promise.resolve({ data: mockPlans });
            if (url.includes('/provider-report')) return Promise.resolve({ data: [] });
            return Promise.resolve({ data: [] });
        });
    };

    it('deve carregar e exibir academias e planos', async () => {
        setupMocks();
        renderComponent();

        expect(await screen.findByText('Gym A')).toBeInTheDocument();
        expect(screen.getByText('Gym B')).toBeInTheDocument();
        expect(screen.getByText(/Plano Gold/i)).toBeInTheDocument();
    });

    it('deve permitir adicionar uma nova academia via Modal', async () => {
        setupMocks();
        axios.post.mockResolvedValue({ data: {} });

        renderComponent();
        
        await screen.findByText('Gerenciar Academias');

        const addBtn = screen.getByLabelText('add-gym');
        fireEvent.click(addBtn);

        expect(screen.getByRole('heading', { name: 'Adicionar Nova Academia' })).toBeInTheDocument();

        fireEvent.change(screen.getByRole('textbox', { name: /Nome da Academia/i }), { target: { value: 'Nova Gym' } });
        fireEvent.change(screen.getByRole('textbox', { name: /Endereço Completo/i }), { target: { value: 'Rua Nova' } });

        fireEvent.click(screen.getByRole('button', { name: 'Adicionar Academia' }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/provider/gyms'),
                expect.objectContaining({ name: 'Nova Gym' }),
                expect.anything()
            );
        });
    });

    it('deve criar um novo plano para uma academia disponível', async () => {
        setupMocks();
        axios.post.mockResolvedValue({ data: {} });

        renderComponent();
        await screen.findByText('Gym A');

        const selectLabel = screen.getByLabelText(/Academia/i);
        fireEvent.mouseDown(selectLabel); 

        const option = await screen.findByRole('option', { name: 'Gym B' });
        fireEvent.click(option);

        fireEvent.change(screen.getByRole('textbox', { name: /Nome do Plano/i }), { target: { value: 'Plano Silver' } });
        const priceInput = screen.getByLabelText(/Preço por Acesso/i);
        fireEvent.change(priceInput, { target: { value: '30' } });

        const createBtn = screen.getByRole('button', { name: 'Criar' });
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/plans'),
                expect.objectContaining({
                    gym_id: 20,
                    name: 'Plano Silver'
                }),
                expect.anything()
            );
        });
    });

    it('deve abrir o Dialog e deletar uma academia', async () => {
        setupMocks();
        axios.delete.mockResolvedValue({ data: {} });

        renderComponent();
        await screen.findByText('Gym A');

        const gymItem = screen.getByText('Gym A').closest('li');
        const deleteBtn = within(gymItem).getByLabelText('delete');
        fireEvent.click(deleteBtn);

        expect(screen.getByText('Deletar Academia')).toBeInTheDocument();
        
        fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith(
                expect.stringContaining('/api/gyms/10'),
                expect.anything()
            );
        });
    });
});