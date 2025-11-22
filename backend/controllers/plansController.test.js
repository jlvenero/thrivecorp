const plansController = require('./plansController');
const plansRepository = require('../models/plansRepository');

// Mock do repositório para isolar a lógica do controller
jest.mock('../models/plansRepository');

describe('Plans Controller', () => {
    let req, res;

    // Silencia o console.error durante os testes para manter o output limpo
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        console.error.mockRestore();
    });

    beforeEach(() => {
        // Reseta mocks e configura objetos req/res básicos antes de cada teste
        jest.clearAllMocks();
        req = {
            provider: { id: 1 }, // Simula o objeto injetado pelo middleware
            body: {},
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(), // Permite encadeamento .status().json()
            json: jest.fn()
        };
    });

    describe('createPlan', () => {
        it('deve criar um plano com sucesso (201)', async () => {
            req.body = {
                gym_id: 10,
                name: 'Plano Gold',
                description: 'Acesso total',
                price_per_access: 50.00
            };

            // Mock: Não existem planos prévios para esta academia
            plansRepository.getPlansByProviderId.mockResolvedValue([]);
            // Mock: Criação retorna o ID 100
            plansRepository.createPlan.mockResolvedValue(100);

            await plansController.createPlan(req, res);

            expect(plansRepository.getPlansByProviderId).toHaveBeenCalledWith(1);
            expect(plansRepository.createPlan).toHaveBeenCalledWith({
                provider_id: 1,
                gym_id: 10,
                name: 'Plano Gold',
                description: 'Acesso total',
                price_per_access: 50.00
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Plano criado com sucesso!', id: 100 });
        });

        it('deve retornar 400 se campos obrigatórios estiverem faltando', async () => {
            req.body = { name: 'Plano Incompleto' }; // Falta gym_id e price

            await plansController.createPlan(req, res);

            expect(plansRepository.createPlan).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Academia, nome e preço são obrigatórios.' });
        });

        it('deve retornar 409 se já existir um plano para a academia (Conflito)', async () => {
            req.body = { gym_id: 10, name: 'Novo Plano', price_per_access: 50 };

            // Mock: Já existe um plano para a gym_id 10
            plansRepository.getPlansByProviderId.mockResolvedValue([
                { id: 5, gym_id: 10, name: 'Plano Antigo' }
            ]);

            await plansController.createPlan(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ error: 'Já existe um plano cadastrado para esta academia.' });
        });

        it('deve retornar 500 em caso de erro no servidor', async () => {
            req.body = { gym_id: 10, name: 'Plano', price_per_access: 20 };
            plansRepository.getPlansByProviderId.mockRejectedValue(new Error('Erro DB'));

            await plansController.createPlan(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao criar o plano.' });
        });
    });

    describe('getMyPlans', () => {
        it('deve retornar a lista de planos do provedor (200)', async () => {
            const mockPlans = [{ id: 1, name: 'Plano A' }, { id: 2, name: 'Plano B' }];
            plansRepository.getPlansByProviderId.mockResolvedValue(mockPlans);

            await plansController.getMyPlans(req, res);

            expect(plansRepository.getPlansByProviderId).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockPlans);
        });

        it('deve retornar 500 em caso de erro', async () => {
            plansRepository.getPlansByProviderId.mockRejectedValue(new Error('Erro DB'));

            await plansController.getMyPlans(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao buscar os planos.' });
        });
    });

    describe('updatePlan', () => {
        it('deve atualizar um plano com sucesso (200)', async () => {
            req.params.planId = 5;
            req.body = { name: 'Plano Atualizado' };
            plansRepository.updatePlan.mockResolvedValue(true); // true indica sucesso (affectedRows > 0)

            await plansController.updatePlan(req, res);

            expect(plansRepository.updatePlan).toHaveBeenCalledWith(5, req.body);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Plano atualizado com sucesso!' });
        });

        it('deve retornar 404 se o plano não for encontrado', async () => {
            req.params.planId = 999;
            plansRepository.updatePlan.mockResolvedValue(false);

            await plansController.updatePlan(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Plano não encontrado.' });
        });

        it('deve retornar 500 em caso de erro', async () => {
            req.params.planId = 5;
            plansRepository.updatePlan.mockRejectedValue(new Error('Erro DB'));

            await plansController.updatePlan(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao atualizar o plano.' });
        });
    });

    describe('deletePlan', () => {
        it('deve deletar um plano com sucesso (200)', async () => {
            req.params.planId = 5;
            plansRepository.deletePlan.mockResolvedValue(true);

            await plansController.deletePlan(req, res);

            expect(plansRepository.deletePlan).toHaveBeenCalledWith(5);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Plano deletado com sucesso!' });
        });

        it('deve retornar 404 se o plano não existir', async () => {
            req.params.planId = 999;
            plansRepository.deletePlan.mockResolvedValue(false);

            await plansController.deletePlan(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Plano não encontrado.' });
        });

        it('deve retornar 500 em caso de erro', async () => {
            req.params.planId = 5;
            plansRepository.deletePlan.mockRejectedValue(new Error('Erro DB'));

            await plansController.deletePlan(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao deletar o plano.' });
        });
    });
});