const accessController = require('./accessController');
const accessRepository = require('../models/accessRepository');
const { Parser } = require('json2csv');

// Mock do repositório e da biblioteca externa
jest.mock('../models/accessRepository');
jest.mock('json2csv');

describe('Access Controller', () => {
    let req, res;

    // Silencia logs de erro durante os testes
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        console.error.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            user: { userId: 1 },
            body: {},
            query: {},
            // Simula dados injetados por middlewares
            provider: { id: 10 },
            companyId: 5
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            header: jest.fn(),
            attachment: jest.fn(),
            send: jest.fn()
        };
    });

    describe('recordAccess', () => {
        it('deve registrar um acesso com sucesso (201)', async () => {
            req.body = { gymId: 20 };
            accessRepository.recordAccess.mockResolvedValue(100);

            await accessController.recordAccess(req, res);

            expect(accessRepository.recordAccess).toHaveBeenCalledWith(1, 20);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Acesso registrado com sucesso!' }));
        });

        it('deve retornar 400 se gymId não for informado', async () => {
            req.body = {}; // Sem gymId

            await accessController.recordAccess(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'O ID da academia é obrigatório.' });
        });

        it('deve retornar 500 em caso de erro no banco', async () => {
            req.body = { gymId: 20 };
            accessRepository.recordAccess.mockRejectedValue(new Error('Erro DB'));

            await accessController.recordAccess(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('Relatórios JSON (Provider & Company)', () => {
        it('getProviderAccessReport deve retornar lista de acessos (200)', async () => {
            const mockData = [{ id: 1, user: 'João' }];
            accessRepository.getAccessesByProviderId.mockResolvedValue(mockData);

            await accessController.getProviderAccessReport(req, res);

            expect(accessRepository.getAccessesByProviderId).toHaveBeenCalledWith(10);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockData);
        });

        it('getProviderAccessReport deve retornar 500 se falhar', async () => {
            accessRepository.getAccessesByProviderId.mockRejectedValue(new Error('Erro DB'));
            await accessController.getProviderAccessReport(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('getCompanyAccessReport deve retornar lista de acessos (200)', async () => {
            const mockData = [{ id: 2, user: 'Maria' }];
            accessRepository.getAccessesByCompanyId.mockResolvedValue(mockData);

            await accessController.getCompanyAccessReport(req, res);

            expect(accessRepository.getAccessesByCompanyId).toHaveBeenCalledWith(5);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockData);
        });

        it('getCompanyAccessReport deve retornar 500 se falhar', async () => {
            accessRepository.getAccessesByCompanyId.mockRejectedValue(new Error('Erro DB'));
            await accessController.getCompanyAccessReport(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('Relatórios de Faturamento (JSON)', () => {
        it('getMonthlyBillingReport deve retornar dados (200)', async () => {
            req.query = { year: 2023, month: 10 };
            const mockReport = [{ company: 'Empresa X', total: 100 }];
            accessRepository.getMonthlyBillingReport.mockResolvedValue(mockReport);

            await accessController.getMonthlyBillingReport(req, res);

            expect(accessRepository.getMonthlyBillingReport).toHaveBeenCalledWith(2023, 10);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockReport);
        });

        it('getMonthlyBillingReport deve retornar 400 se faltar ano ou mês', async () => {
            req.query = { year: 2023 }; // Falta mês
            await accessController.getMonthlyBillingReport(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('getMonthlyBillingReport deve retornar 500 se falhar', async () => {
            req.query = { year: 2023, month: 10 };
            accessRepository.getMonthlyBillingReport.mockRejectedValue(new Error('Erro DB'));
            await accessController.getMonthlyBillingReport(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('Detalhes de Acesso da Empresa (JSON)', () => {
        // ESTA ERA A PARTE QUE FALTAVA (Linhas 54-72 do relatório original)
        it('getCompanyAccessDetails deve retornar detalhes (200)', async () => {
            req.query = { year: 2023, month: 10 };
            const mockDetails = [{ id: 1, user: 'Teste' }];
            accessRepository.getCompanyAccessDetails.mockResolvedValue(mockDetails);

            await accessController.getCompanyAccessDetails(req, res);

            expect(accessRepository.getCompanyAccessDetails).toHaveBeenCalledWith(5, 2023, 10);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockDetails);
        });

        it('getCompanyAccessDetails deve retornar 400 se faltar parametros', async () => {
            req.query = { month: 10 }; // Falta ano
            await accessController.getCompanyAccessDetails(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('getCompanyAccessDetails deve retornar 500 se falhar', async () => {
            req.query = { year: 2023, month: 10 };
            accessRepository.getCompanyAccessDetails.mockRejectedValue(new Error('Erro DB'));
            await accessController.getCompanyAccessDetails(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('Downloads CSV', () => {
        it('downloadCompanyAccessReport deve gerar CSV e enviar (200)', async () => {
            req.query = { year: 2023, month: 10 };
            const mockData = [{ access_timestamp: '2023-10-01', first_name: 'A', last_name: 'B', gym_name: 'G', price_per_access: 10 }];
            accessRepository.getCompanyAccessDetails.mockResolvedValue(mockData);

            const mockParse = jest.fn().mockReturnValue('csv,dados');
            Parser.mockImplementation(() => ({ parse: mockParse }));

            await accessController.downloadCompanyAccessReport(req, res);

            expect(res.header).toHaveBeenCalledWith('Content-Type', 'text/csv');
            expect(res.attachment).toHaveBeenCalled();
            expect(res.send).toHaveBeenCalledWith('csv,dados');
        });

        it('downloadCompanyAccessReport deve retornar 400 se faltar parametros', async () => {
            req.query = {};
            await accessController.downloadCompanyAccessReport(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('downloadCompanyAccessReport deve retornar 404 se não houver dados', async () => {
            req.query = { year: 2023, month: 10 };
            accessRepository.getCompanyAccessDetails.mockResolvedValue([]);
            await accessController.downloadCompanyAccessReport(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('downloadCompanyAccessReport deve retornar 500 se falhar', async () => {
            req.query = { year: 2023, month: 10 };
            accessRepository.getCompanyAccessDetails.mockRejectedValue(new Error('Erro'));
            await accessController.downloadCompanyAccessReport(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('downloadBillingReport deve gerar CSV e enviar (200)', async () => {
            req.query = { year: 2023, month: 10 };
            const mockData = [{ company_name: 'A', billing_status: 'sent', total_cost: 100 }];
            accessRepository.getMonthlyBillingReport.mockResolvedValue(mockData);

            const mockParse = jest.fn().mockReturnValue('csv,faturamento');
            Parser.mockImplementation(() => ({ parse: mockParse }));

            await accessController.downloadBillingReport(req, res);

            expect(res.send).toHaveBeenCalledWith('csv,faturamento');
        });

        it('downloadBillingReport deve retornar 400 se faltar parametros', async () => {
            req.query = {};
            await accessController.downloadBillingReport(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('downloadBillingReport deve retornar 404 se não houver dados', async () => {
            req.query = { year: 2023, month: 10 };
            accessRepository.getMonthlyBillingReport.mockResolvedValue([]);
            await accessController.downloadBillingReport(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('downloadBillingReport deve retornar 500 se falhar', async () => {
            req.query = { year: 2023, month: 10 };
            accessRepository.getMonthlyBillingReport.mockRejectedValue(new Error('Erro'));
            await accessController.downloadBillingReport(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});