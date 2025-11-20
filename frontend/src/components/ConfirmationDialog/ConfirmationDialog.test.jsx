import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConfirmationDialog from './index';

describe('ConfirmationDialog Component', () => {
    
    it('não deve ser visível quando a prop open for false', () => {
        render(
            <ConfirmationDialog 
                open={false} 
                title="Título Teste" 
                message="Mensagem Teste" 
                onClose={() => {}} 
                onConfirm={() => {}} 
            />
        );
        // queryByText retorna null se não encontrar (o que esperamos aqui)
        expect(screen.queryByText('Título Teste')).not.toBeInTheDocument();
    });

    it('deve exibir título e mensagem quando open for true', () => {
        render(
            <ConfirmationDialog 
                open={true} 
                title="Deletar Item" 
                message="Tem certeza?" 
                onClose={() => {}} 
                onConfirm={() => {}} 
            />
        );
        expect(screen.getByText('Deletar Item')).toBeInTheDocument();
        expect(screen.getByText('Tem certeza?')).toBeInTheDocument();
    });

    it('deve chamar a função onConfirm ao clicar no botão Confirmar', () => {
        const handleConfirm = vi.fn(); // Espião
        render(
            <ConfirmationDialog 
                open={true} 
                title="Teste" 
                message="Msg" 
                onConfirm={handleConfirm} 
                onClose={() => {}} 
            />
        );

        const confirmBtn = screen.getByRole('button', { name: 'Confirmar' });
        fireEvent.click(confirmBtn);

        expect(handleConfirm).toHaveBeenCalledTimes(1);
    });

    it('deve chamar a função onClose ao clicar no botão Cancelar', () => {
        const handleClose = vi.fn();
        render(
            <ConfirmationDialog 
                open={true} 
                title="Teste" 
                message="Msg" 
                onConfirm={() => {}} 
                onClose={handleClose} 
            />
        );

        const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
        fireEvent.click(cancelBtn);

        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});