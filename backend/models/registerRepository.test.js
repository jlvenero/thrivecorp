const registerRepository = require('./registerRepository');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

jest.mock('mysql2/promise');
jest.mock('bcryptjs');

describe('Register Repository', () => {
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
        bcrypt.hash.mockResolvedValue('hash_123');
    });

    it('registerUserAndEntity deve cadastrar Usuário e Empresa', async () => {
        mockExecute.mockResolvedValueOnce([{ insertId: 10 }]); // User
        mockExecute.mockResolvedValueOnce([{ insertId: 50 }]); // Company

        const userData = { role: 'company_admin', email: 'adm@empresa.com', password: '123' };
        const entityData = { name: 'Empresa LTDA', cnpj: '000' };

        const result = await registerRepository.registerUserAndEntity(userData, entityData);

        expect(mockBegin).toHaveBeenCalled();
        expect(mockCommit).toHaveBeenCalled();
        expect(result).toBe(10);
    });

    it('registerUserAndEntity deve cadastrar Usuário e Provider', async () => {
        mockExecute.mockResolvedValueOnce([{ insertId: 11 }]); // User
        mockExecute.mockResolvedValueOnce([{ insertId: 51 }]); // Provider

        const userData = { role: 'provider', email: 'gym@p.com', password: '123' };
        const entityData = { name: 'Gym Owner', cnpj: '111' };

        await registerRepository.registerUserAndEntity(userData, entityData);
        expect(mockCommit).toHaveBeenCalled();
    });

    it('deve fazer rollback se falhar', async () => {
        mockExecute.mockRejectedValue(new Error('Duplicate'));
        const userData = { password: '123' };
        
        await expect(registerRepository.registerUserAndEntity(userData, {}))
            .rejects.toThrow('Duplicate');
        expect(mockRollback).toHaveBeenCalled();
    });
});