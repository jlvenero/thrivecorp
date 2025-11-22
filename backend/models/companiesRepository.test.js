const companiesRepository = require('./companiesRepository');
const mysql = require('mysql2/promise');

jest.mock('mysql2/promise');

describe('Companies Repository', () => {
    const mockExecute = jest.fn();
    const mockEnd = jest.fn();
    const mockBegin = jest.fn();
    const mockCommit = jest.fn();
    const mockRollback = jest.fn();

    beforeAll(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

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

    describe('Simples (Create, Get)', () => {
        it('createCompany deve inserir e retornar ID', async () => {
            mockExecute.mockResolvedValue([{ insertId: 50 }]);
            const result = await companiesRepository.createCompany({ name: 'Empresa', cnpj: '123', address: 'Rua', admin_id: 1 });
            expect(result).toBe(50);
        });

        it('getAllCompanies deve retornar lista', async () => {
            const list = [{ id: 1 }, { id: 2 }];
            mockExecute.mockResolvedValue([list]);
            const result = await companiesRepository.getAllCompanies();
            expect(result).toEqual(list);
        });

        it('getCompanyById deve retornar empresa', async () => {
            const company = { id: 1, name: 'A' };
            mockExecute.mockResolvedValue([[company]]);
            const result = await companiesRepository.getCompanyById(1);
            expect(result).toEqual(company);
        });
    });

    describe('deleteCompany (Transação)', () => {
        it('deve realizar rollback e retornar false se empresa não existir', async () => {
            // Primeira query: SELECT admin_id -> retorna vazio
            mockExecute.mockResolvedValueOnce([[]]); 

            const result = await companiesRepository.deleteCompany(99);

            expect(mockBegin).toHaveBeenCalled();
            expect(mockRollback).toHaveBeenCalled();
            expect(mockEnd).toHaveBeenCalled();
            expect(result).toBe(false);
        });

        it('deve deletar empresa, colaboradores e usuários com sucesso', async () => {
            // 1. Select Admin -> retorna admin_id 10
            mockExecute.mockResolvedValueOnce([[{ admin_id: 10 }]]);
            // 2. Select Colaboradores -> retorna [{user_id: 20}]
            mockExecute.mockResolvedValueOnce([[{ user_id: 20 }]]);
            // 3. Delete Colaboradores -> ok
            mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
            // 4. Delete Empresa -> ok (1 afetado)
            mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
            // 5. Delete Users -> ok
            mockExecute.mockResolvedValueOnce([{ affectedRows: 2 }]);

            const result = await companiesRepository.deleteCompany(1);

            expect(mockBegin).toHaveBeenCalled();
            expect(mockCommit).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('deve dar throw e rollback em caso de erro no meio do processo', async () => {
            mockExecute.mockRejectedValue(new Error('Erro DB'));
            await expect(companiesRepository.deleteCompany(1)).rejects.toThrow('Erro DB');
            expect(mockRollback).toHaveBeenCalled();
        });
    });

    describe('approveCompany (Transação)', () => {
        it('deve aprovar empresa e admin', async () => {
            // 1. Select Admin -> retorna 10
            mockExecute.mockResolvedValueOnce([[{ admin_id: 10 }]]);
            // 2. Update Company -> ok
            mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
            // 3. Update User -> ok
            mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const result = await companiesRepository.approveCompany(1);

            expect(mockCommit).toHaveBeenCalled();
            expect(result).toBe(true);
        });
    });
});