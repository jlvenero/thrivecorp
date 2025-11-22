const providersController = require('./providersController');
const providersRepository = require('../models/providersRepository');
const plansRepository = require('../models/plansRepository');

// Mocks
jest.mock('../models/providersRepository');
jest.mock('../models/plansRepository');

describe('Providers Controller', () => {
    let req, res;

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterAll(() => {
        console.error.mockRestore();
        console.log.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            params: {},
            body: {},
            user: { userId: 1 },
            provider: { id: 10 } // Simula middleware getProviderDetails
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('Gestão de Prestadores (Providers)', () => {
        it('registerProvider deve criar prestador com sucesso (201)', async () => {
            req.body = { user_id: 1, name: 'Provider Name', cnpj: '123' };
            providersRepository.createProvider.mockResolvedValue(5);

            await providersController.registerProvider(req, res);

            expect(providersRepository.createProvider).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 5 }));
        });

        it('registerProvider deve retornar 500 em caso de erro', async () => {
            providersRepository.createProvider.mockRejectedValue(new Error('Erro'));
            await providersController.registerProvider(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('listProviders deve retornar lista (200)', async () => {
            const mockList = [{ id: 1 }, { id: 2 }];
            providersRepository.getAllProviders.mockResolvedValue(mockList);
            await providersController.listProviders(req, res);
            expect(res.json).toHaveBeenCalledWith(mockList);
        });

        it('listProviders deve retornar 500 em caso de erro', async () => {
            providersRepository.getAllProviders.mockRejectedValue(new Error('Erro'));
            await providersController.listProviders(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('getProvider deve retornar prestador (200)', async () => {
            req.params.id = 5;
            const mockProvider = { id: 5, name: 'Provider' };
            providersRepository.getProviderById.mockResolvedValue(mockProvider);
            await providersController.getProvider(req, res);
            expect(res.json).toHaveBeenCalledWith(mockProvider);
        });

        it('getProvider deve retornar 404 se não encontrado', async () => {
            req.params.id = 99;
            providersRepository.getProviderById.mockResolvedValue(null);
            await providersController.getProvider(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('updateProvider deve atualizar com sucesso (200)', async () => {
            req.params.id = 5;
            req.body = { name: 'Novo Nome' };
            providersRepository.updateProvider.mockResolvedValue(true);
            await providersController.updateProvider(req, res);
            expect(res.json).toHaveBeenCalledWith({ message: 'Prestador atualizado com sucesso.' });
        });

        it('updateProvider deve retornar 404 se não atualizar', async () => {
            req.params.id = 5;
            providersRepository.updateProvider.mockResolvedValue(false);
            await providersController.updateProvider(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('deleteProvider deve deletar com sucesso (200)', async () => {
            req.params.id = 5;
            providersRepository.deleteProvider.mockResolvedValue(true);
            await providersController.deleteProvider(req, res);
            expect(res.json).toHaveBeenCalledWith({ message: 'Prestador deletado com sucesso.' });
        });

        it('deleteProvider deve retornar 404 se não deletar', async () => {
            req.params.id = 5;
            providersRepository.deleteProvider.mockResolvedValue(false);
            await providersController.deleteProvider(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('Gestão de Academias (Gyms)', () => {
        it('registerGym deve criar academia (201)', async () => {
            req.body = { provider_id: 1, name: 'Gym' };
            providersRepository.createGym.mockResolvedValue(10);
            await providersController.registerGym(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('registerGym deve retornar 500 em caso de erro', async () => {
            providersRepository.createGym.mockRejectedValue(new Error('Erro'));
            await providersController.registerGym(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('addOwnGym deve cadastrar academia para o provider logado (201)', async () => {
            req.body = { name: 'Minha Academia', address: 'Rua X' };
            providersRepository.createGym.mockResolvedValue(50);

            await providersController.addOwnGym(req, res);

            expect(providersRepository.createGym).toHaveBeenCalledWith({
                provider_id: 10, // req.provider.id
                name: 'Minha Academia',
                address: 'Rua X'
            });
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('listAllGymsForAdmin deve retornar todas as academias (200)', async () => {
            const mockGyms = [{ id: 1 }];
            providersRepository.getAllGymsForAdmin.mockResolvedValue(mockGyms);
            await providersController.listAllGymsForAdmin(req, res);
            expect(res.json).toHaveBeenCalledWith(mockGyms);
        });

        it('listProviderGyms deve retornar academias do prestador (200)', async () => {
            providersRepository.getGymsByProviderId.mockResolvedValue([]);
            await providersController.listProviderGyms(req, res);
            expect(providersRepository.getGymsByProviderId).toHaveBeenCalledWith(10);
            expect(res.json).toHaveBeenCalledWith([]);
        });

        it('listGyms deve retornar academias ativas (200)', async () => {
            providersRepository.getAllGyms.mockResolvedValue([]);
            await providersController.listGyms(req, res);
            expect(res.json).toHaveBeenCalledWith([]);
        });

        it('getGym deve retornar dados da academia (200)', async () => {
            req.params.id = 50;
            const mockGym = { id: 50, name: 'Gym Test' };
            providersRepository.getGymById.mockResolvedValue(mockGym);
            await providersController.getGym(req, res);
            expect(res.json).toHaveBeenCalledWith(mockGym);
        });

        it('getGym deve retornar 404 se não encontrar', async () => {
            req.params.id = 99;
            providersRepository.getGymById.mockResolvedValue(null);
            await providersController.getGym(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('updateGym deve atualizar com sucesso (200)', async () => {
            req.params.id = 50;
            req.body = { name: 'Gym Up' };
            providersRepository.updateGym.mockResolvedValue(true);
            await providersController.updateGym(req, res);
            expect(res.json).toHaveBeenCalledWith({ message: 'Academia atualizada com sucesso.' });
        });

        it('updateGym deve retornar 404 se falhar', async () => {
            req.params.id = 50;
            providersRepository.updateGym.mockResolvedValue(false);
            await providersController.updateGym(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('deleteGym deve deletar com sucesso (200)', async () => {
            req.params.id = 50;
            providersRepository.deleteGym.mockResolvedValue(true);
            await providersController.deleteGym(req, res);
            expect(res.json).toHaveBeenCalledWith({ message: 'Academia deletada com sucesso.' });
        });

        it('deleteGym deve retornar 404 se falhar', async () => {
            req.params.id = 50;
            providersRepository.deleteGym.mockResolvedValue(false);
            await providersController.deleteGym(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('Aprovação e Reprovação', () => {
        it('approveGym deve aprovar com sucesso', async () => {
            req.params.id = 50;
            providersRepository.approveGym.mockResolvedValue(true);
            await providersController.approveGym(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('approveGym deve retornar 404 se academia não existir', async () => {
            req.params.id = 99;
            providersRepository.approveGym.mockResolvedValue(false);
            await providersController.approveGym(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('reproveGym deve executar lógica de reprovação (200)', async () => {
            req.params.id = 50;
            providersRepository.reproveGymAndDeactivateProvider.mockResolvedValue(true);
            await providersController.reproveGym(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('reproveGym deve retornar erro 500 se falhar', async () => {
            req.params.id = 50;
            providersRepository.reproveGymAndDeactivateProvider.mockRejectedValue(new Error('Erro'));
            await providersController.reproveGym(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('Planos (Integration)', () => {
        it('getGymPlan deve retornar plano da academia', async () => {
            req.params.gymId = 50;
            const mockPlan = { id: 1, name: 'Basic' };
            plansRepository.getPlanByGymId.mockResolvedValue(mockPlan);
            await providersController.getGymPlan(req, res);
            expect(res.json).toHaveBeenCalledWith(mockPlan);
        });

        it('getGymPlan deve retornar 404 se não houver plano', async () => {
            req.params.gymId = 50;
            plansRepository.getPlanByGymId.mockResolvedValue(null);
            await providersController.getGymPlan(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});