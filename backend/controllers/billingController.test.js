const billingController = require('./billingController');
const billingRepository = require('../models/billingRepository');
const logger = require('../utils/logger'); // Importar para validar chamadas (opcional)

// 1. MOCK DO LOGGER (Essencial para não quebrar ao chamar logger.info)
jest.mock('../utils/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

jest.mock('../models/billingRepository');

describe('Billing Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {},
            // 2. CORREÇÃO CRÍTICA: Adicionar o objeto user
            // O controller tenta ler req.user.userId para o log. Sem isso, gera erro 500.
            user: { userId: 1, role: 'admin' } 
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
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
            
            // Verifica se o log de auditoria foi chamado corretamente
            expect(logger.info).toHaveBeenCalledWith(
                'Status de faturamento atualizado',
                expect.objectContaining({ adminId: 1, newStatus: 'sent' })
            );
        });

        it('deve usar "sent" como padrão se o status não for fornecido', async () => {
            req.body = { companyId: 1, year: 2023, month: 10 }; // sem status
            billingRepository.upsertBillingStatus.mockResolvedValue(true);

            await billingController.updateBillingStatus(req, res);

            expect(billingRepository.upsertBillingStatus).toHaveBeenCalledWith(1, 2023, 10, 'sent');
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('deve retornar 400 se parâmetros obrigatórios faltarem', async () => {
            req.body = { companyId: 1 }; // incompleto
            await billingController.updateBillingStatus(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('deve retornar 500 em caso de erro do banco', async () => {
            req.body = { companyId: 1, year: 2023, month: 10, status: 'sent' };
            billingRepository.upsertBillingStatus.mockRejectedValue(new Error('DB Error'));
            
            await billingController.updateBillingStatus(req, res);
            
            expect(res.status).toHaveBeenCalledWith(500);
            expect(logger.error).toHaveBeenCalled(); // Verifica se o erro foi logado
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
            
            // Verifica log de auditoria
            expect(logger.info).toHaveBeenCalledWith(
                'Faturamento marcado como enviado',
                expect.objectContaining({ adminId: 1 })
            );
        });

        it('deve retornar 400 se faltar parâmetros', async () => {
            req.body = { companyId: 5 };
            await billingController.markAsSent(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('deve retornar 500 se der erro', async () => {
            req.body = { companyId: 5, year: 2024, month: 1 };
            billingRepository.upsertBillingStatus.mockRejectedValue(new Error('Fail'));
            await billingController.markAsSent(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(logger.error).toHaveBeenCalled();
        });
    });
});