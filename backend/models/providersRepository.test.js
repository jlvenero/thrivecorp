const providersRepository = require('./providersRepository');
const mysql = require('mysql2/promise');

jest.mock('mysql2/promise');

describe('Providers Repository', () => {
    const mockExecute = jest.fn();
    const mockEnd = jest.fn();
    const mockBegin = jest.fn();
    const mockCommit = jest.fn();
    const mockRollback = jest.fn();

    // --- BLOCO DE SILÊNCIO ---
    // Isso impede que console.log e console.error apareçam no terminal durante os testes
    beforeAll(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });
    // -------------------------

    beforeEach(() => {
        jest.clearAllMocks();
        mysql.createConnection.mockResolvedValue({
            execute: mockExecute,
            end: mockEnd,
            beginTransaction: mockBegin,
            commit: mockCommit,
            rollback: mockRollback
        });
    });

    // --- TESTES BÁSICOS ---
    describe('CRUDs Básicos', () => {
        it('getAllProviders deve retornar lista', async () => {
            mockExecute.mockResolvedValue([[{ id: 1 }]]);
            const result = await providersRepository.getAllProviders();
            expect(result).toHaveLength(1);
        });

        it('getProviderById deve retornar um', async () => {
            mockExecute.mockResolvedValue([[{ id: 1 }]]);
            const result = await providersRepository.getProviderById(1);
            expect(result).toEqual({ id: 1 });
        });

        it('getProviderByUserId deve retornar um', async () => {
            mockExecute.mockResolvedValue([[{ id: 1 }]]);
            const result = await providersRepository.getProviderByUserId(10);
            expect(result).toEqual({ id: 1 });
        });

        it('updateProvider deve atualizar', async () => {
            mockExecute.mockResolvedValue([{ affectedRows: 1 }]);
            const result = await providersRepository.updateProvider(1, { name: 'N', cnpj: 'C', address: 'A' });
            expect(result).toBe(true);
        });

        it('deleteProvider deve deletar', async () => {
            mockExecute.mockResolvedValue([{ affectedRows: 1 }]);
            const result = await providersRepository.deleteProvider(1);
            expect(result).toBe(true);
        });

        it('getGymsByProviderId deve retornar lista', async () => {
            mockExecute.mockResolvedValue([[{ id: 10 }]]);
            const result = await providersRepository.getGymsByProviderId(1);
            expect(result).toHaveLength(1);
        });

        it('updateGym deve atualizar', async () => {
            mockExecute.mockResolvedValue([{ affectedRows: 1 }]);
            const result = await providersRepository.updateGym(10, { name: 'G' });
            expect(result).toBe(true);
        });

        it('deleteGym deve deletar', async () => {
            mockExecute.mockResolvedValue([{ affectedRows: 1 }]);
            const result = await providersRepository.deleteGym(10);
            expect(result).toBe(true);
        });
    });
    
    // --- TESTES COMPLEXOS ---
    describe('Create Operations', () => {
        it('createProvider deve retornar ID', async () => {
            mockExecute.mockResolvedValue([{ insertId: 5 }]);
            const result = await providersRepository.createProvider({ user_id: 1, name: 'P', cnpj: '00' });
            expect(result).toBe(5);
        });

        it('createGym deve retornar ID', async () => {
            mockExecute.mockResolvedValue([{ insertId: 10 }]);
            const result = await providersRepository.createGym({ provider_id: 5, name: 'Gym', address: 'Rua' });
            expect(result).toBe(10);
        });

        it('getAllGyms deve retornar ativas', async () => {
            mockExecute.mockResolvedValue([[{ id: 1 }]]);
            await providersRepository.getAllGyms();
            expect(mockExecute).toHaveBeenCalledWith(expect.stringContaining("status = 'active'"));
        });
        
        it('getAllGymsForAdmin deve retornar todas', async () => {
            mockExecute.mockResolvedValue([[]]);
            await providersRepository.getAllGymsForAdmin();
            expect(mockExecute).toHaveBeenCalled();
        });
    });

    describe('Lógica de Reprovação', () => {
        it('reproveGymAndDeactivateProvider deve usar transação', async () => {
            mockExecute.mockResolvedValueOnce([[{ provider_id: 5 }]]); // Select Gym
            mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]); // Delete Gym
            mockExecute.mockResolvedValueOnce([[{ count: 0 }]]); // Count
            mockExecute.mockResolvedValueOnce([[{ user_id: 1 }]]); // Select User
            mockExecute.mockResolvedValueOnce({}); // Delete Provider
            mockExecute.mockResolvedValueOnce({}); // Delete User

            const result = await providersRepository.reproveGymAndDeactivateProvider(100);
            expect(mockCommit).toHaveBeenCalled();
            expect(result).toBe(true);
        });
        
        it('deve fazer rollback se academia não existir', async () => {
             mockExecute.mockResolvedValueOnce([[]]); // Array vazio = não achou
             
             await expect(providersRepository.reproveGymAndDeactivateProvider(1))
                .rejects.toThrow(); // Espera que lance o erro
             
             expect(mockRollback).toHaveBeenCalled(); // Verifica se chamou rollback
        });
    });

    describe('Lógica de Aprovação', () => {
        it('approveGym deve usar transação', async () => {
            mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]); // Update Gym
            mockExecute.mockResolvedValueOnce([[{ provider_id: 5 }]]); // Select Prov
            mockExecute.mockResolvedValueOnce([[{ user_id: 1 }]]); // Select User
            mockExecute.mockResolvedValueOnce({}); // Update User

            const result = await providersRepository.approveGym(100);
            expect(mockCommit).toHaveBeenCalled();
            expect(result).toBe(true);
        });
    });
});