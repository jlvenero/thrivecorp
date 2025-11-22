const billingController = require('./billingController');
const billingRepository = require('../models/billingRepository');

jest.mock('../models/billingRepository');

describe('Billing Controller', () => {
    let req, res;

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        console.error.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('updateBillingStatus', () => {
        it('deve atualizar o status com sucesso (200)', async () => {
            req.body = { companyId: 1, year: 2023, month: 10, status: 'sent' };
            billingRepository.upsertBillingStatus.mockResolvedValue(true);

            await billingController.updateBillingStatus(req, res);

            expect(billingRepository.upsertBillingStatus).toHaveBeenCalledWith(1, 2023, 10, 'sent');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Status de faturação atualizado para sent.' });
        });

        it('deve usar "sent" como padrão se o status não for fornecido', async () => {
            req.body = { companyId: 1, year: 2023, month: 10 }; // Sem status
            billingRepository.upsertBillingStatus.mockResolvedValue(true);

            await billingController.updateBillingStatus(req, res);

            expect(billingRepository.upsertBillingStatus).toHaveBeenCalledWith(1, 2023, 10, 'sent');
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('deve retornar 400 se parâmetros obrigatórios faltarem', async () => {
            req.body = { year: 2023 }; // Faltam dados

            await billingController.updateBillingStatus(req, res);

            expect(billingRepository.upsertBillingStatus).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('obrigatórios') }));
        });

        it('deve retornar 400 se o status for inválido', async () => {
            req.body = { companyId: 1, year: 2023, month: 10, status: 'invalido' };

            await billingController.updateBillingStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('deve retornar 500 em caso de erro no servidor', async () => {
            req.body = { companyId: 1, year: 2023, month: 10 };
            billingRepository.upsertBillingStatus.mockRejectedValue(new Error('Erro DB'));

            await billingController.updateBillingStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro no servidor ao atualizar o status.' });
        });
    });

    describe('markAsSent', () => {
        it('deve marcar como enviado com sucesso (200)', async () => {
            req.body = { companyId: 5, year: 2024, month: 1 };
            billingRepository.upsertBillingStatus.mockResolvedValue(true);

            await billingController.markAsSent(req, res);

            expect(billingRepository.upsertBillingStatus).toHaveBeenCalledWith(5, 2024, 1, 'sent');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Status de faturação atualizado para enviado.' });
        });

        it('deve retornar 400 se faltarem parâmetros', async () => {
            req.body = { companyId: 5 }; // Falta ano e mês

            await billingController.markAsSent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'ID da empresa, ano e mês são obrigatórios.' });
        });

        it('deve retornar 500 em caso de erro no servidor', async () => {
            req.body = { companyId: 5, year: 2024, month: 1 };
            billingRepository.upsertBillingStatus.mockRejectedValue(new Error('Erro DB'));

            await billingController.markAsSent(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro no servidor ao atualizar o status.' });
        });
    });
});