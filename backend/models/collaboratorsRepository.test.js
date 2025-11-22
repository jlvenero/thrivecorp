const collaboratorsRepository = require('./collaboratorsRepository');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

jest.mock('mysql2/promise');
jest.mock('bcryptjs');

describe('Collaborators Repository', () => {
    const mockExecute = jest.fn();
    const mockEnd = jest.fn();
    const mockBegin = jest.fn();
    const mockCommit = jest.fn();
    const mockRollback = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mysql.createConnection.mockResolvedValue({
            execute: mockExecute,
            end: mockEnd,
            beginTransaction: mockBegin,
            commit: mockCommit,
            rollback: mockRollback
        });
        // Mock do hash para evitar erros
        bcrypt.hash.mockResolvedValue('hashed_password');
    });

    describe('addCollaborator', () => {
        it('deve criar colaborador com sucesso (Transação)', async () => {
            mockExecute.mockResolvedValueOnce([{ insertId: 50 }]); // Insert User
            mockExecute.mockResolvedValueOnce({}); // Insert Collaborator/Update

            const userData = { first_name: 'Ana', email: 'ana@test.com', password: '123' };
            const result = await collaboratorsRepository.addCollaborator(userData, 1);

            expect(mockBegin).toHaveBeenCalled();
            expect(mockCommit).toHaveBeenCalled();
            expect(result).toBe(50);
        });

        it('deve fazer rollback em caso de erro', async () => {
            mockExecute.mockRejectedValue(new Error('Erro DB'));
            // Passamos password para o destructuring não falhar
            await expect(collaboratorsRepository.addCollaborator({ password: '123' }, 1))
                .rejects.toThrow('Erro DB');
            expect(mockRollback).toHaveBeenCalled();
        });
    });

    describe('getCollaborators', () => {
        it('getCollaboratorsByCompanyId deve retornar lista', async () => {
            const list = [{ id: 1, name: 'Ana' }];
            mockExecute.mockResolvedValue([list]);
            const result = await collaboratorsRepository.getCollaboratorsByCompanyId(1);
            expect(result).toEqual(list);
        });
    });

    describe('deactivateCollaborator', () => {
        it('deve desativar colaborador com sucesso', async () => {
            // 1. SELECT para encontrar o user_id
            mockExecute.mockResolvedValueOnce([[{ user_id: 99 }]]);
            // 2. UPDATE no status
            mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const result = await collaboratorsRepository.deactivateCollaborator(10);
            expect(result).toBe(true);
        });

        it('deve lançar erro se colaborador não encontrado', async () => {
            // SELECT retorna vazio
            mockExecute.mockResolvedValueOnce([[]]);
            await expect(collaboratorsRepository.deactivateCollaborator(99))
                .rejects.toThrow('Colaborador não encontrado.');
        });
    });
});