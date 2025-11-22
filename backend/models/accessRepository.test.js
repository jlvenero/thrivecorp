const accessRepository = require('./accessRepository');
const mysql = require('mysql2/promise');

jest.mock('mysql2/promise');

describe('Access Repository', () => {
    const mockExecute = jest.fn();
    const mockEnd = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mysql.createConnection.mockResolvedValue({
            execute: mockExecute,
            end: mockEnd
        });
    });

    it('recordAccess deve inserir registro e retornar ID', async () => {
        mockExecute.mockResolvedValue([{ insertId: 100 }]);
        const result = await accessRepository.recordAccess(1, 20); // userId, gymId
        expect(result).toBe(100);
    });

    it('getAccessesByProviderId deve retornar acessos', async () => {
        const mockData = [{ id: 1, gym_name: 'Gym A' }];
        mockExecute.mockResolvedValue([mockData]);
        const result = await accessRepository.getAccessesByProviderId(10);
        expect(result).toEqual(mockData);
    });

    it('getAccessesByCompanyId deve retornar acessos', async () => {
        const mockData = [{ id: 1, employee_name: 'João' }];
        mockExecute.mockResolvedValue([mockData]);
        const result = await accessRepository.getAccessesByCompanyId(5);
        expect(result).toEqual(mockData);
    });

    it('getMonthlyBillingReport deve filtrar por ano e mês', async () => {
        mockExecute.mockResolvedValue([[]]);
        await accessRepository.getMonthlyBillingReport(2023, 10);
        
        // Query complexa com JOINs
        expect(mockExecute).toHaveBeenCalledWith(
            expect.stringContaining('FROM accesses AS a'),
            // O array contém o ano/mes duplicado por causa dos joins, conforme o log de erro
            [2023, 10, 2023, 10]
        );
    });

    it('getCompanyAccessDetails deve filtrar por empresa, ano e mês', async () => {
        mockExecute.mockResolvedValue([[]]);
        await accessRepository.getCompanyAccessDetails(5, 2023, 10);
        
        // Query complexa com JOINs e WHERE específico
        expect(mockExecute).toHaveBeenCalledWith(
            expect.stringContaining('WHERE collabs.company_id = ? AND YEAR(a.access_timestamp) = ?'),
            [5, 2023, 10]
        );
    });
});