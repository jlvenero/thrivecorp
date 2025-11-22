const plansRepository = require('./plansRepository');
const mysql = require('mysql2/promise');

jest.mock('mysql2/promise');

describe('Plans Repository', () => {
    const mockExecute = jest.fn();
    const mockEnd = jest.fn();

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
            end: mockEnd
        });
    });

    it('createPlan deve inserir e retornar ID', async () => {
        mockExecute.mockResolvedValue([{ insertId: 10 }]);
        const planData = { provider_id: 1, gym_id: 2, name: 'Gold', price_per_access: 50 };
        
        const result = await plansRepository.createPlan(planData);
        
        expect(mockExecute).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO plans'),
            expect.arrayContaining([1, 2, 'Gold', 50])
        );
        expect(result).toBe(10);
    });

    it('getPlansByProviderId deve retornar lista', async () => {
        const mockList = [{ id: 1, name: 'Gold' }];
        mockExecute.mockResolvedValue([mockList]);
        
        const result = await plansRepository.getPlansByProviderId(1);
        
        expect(result).toEqual(mockList);
    });

    it('getPlanByGymId deve retornar o primeiro plano encontrado', async () => {
        const mockPlan = { id: 1, name: 'Gold' };
        mockExecute.mockResolvedValue([[mockPlan]]);
        
        const result = await plansRepository.getPlanByGymId(10);
        
        expect(result).toEqual(mockPlan);
    });

    it('getPlanByGymId deve retornar null se não houver plano', async () => {
        mockExecute.mockResolvedValue([[]]);
        const result = await plansRepository.getPlanByGymId(10);
        expect(result).toBeNull();
    });

    it('updatePlan deve retornar true se atualizar', async () => {
        mockExecute.mockResolvedValue([{ affectedRows: 1 }]);
        const result = await plansRepository.updatePlan(1, { name: 'New Name', price_per_access: 60 });
        expect(result).toBe(true);
    });

    it('deletePlan deve retornar true se deletar', async () => {
        mockExecute.mockResolvedValue([{ affectedRows: 1 }]);
        const result = await plansRepository.deletePlan(1);
        expect(result).toBe(true);
    });
});