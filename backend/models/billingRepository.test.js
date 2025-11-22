const billingRepository = require('./billingRepository');
const mysql = require('mysql2/promise');

jest.mock('mysql2/promise');

describe('Billing Repository', () => {
    const mockExecute = jest.fn();
    const mockEnd = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mysql.createConnection.mockResolvedValue({
            execute: mockExecute,
            end: mockEnd
        });
    });

    it('upsertBillingStatus deve executar query de INSERT/UPDATE', async () => {
        mockExecute.mockResolvedValue([{ affectedRows: 1 }]);
        
        await billingRepository.upsertBillingStatus(1, 2023, 10, 'sent');
        
        // A query real usa INSERT INTO billing_history ... ON DUPLICATE KEY UPDATE
        // Vamos verificar se contém partes chaves da query para não quebrar com espaços em branco
        expect(mockExecute).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO billing_history'),
            expect.arrayContaining([
                1, 
                2023, 
                10, 
                'sent',
                // O último parametro é uma data gerada na hora, aceitamos qualquer string ou objeto
                expect.anything() 
            ])
        );
    });
});