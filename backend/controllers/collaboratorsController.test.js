const collaboratorsController = require('./collaboratorsController');
const collaboratorsRepository = require('../models/collaboratorsRepository');

// Mock do repositório
jest.mock('../models/collaboratorsRepository');

describe('Collaborators Controller', () => {
    let req, res;

    // --- NOVO: Silencia o console.error antes dos testes ---
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    // --- NOVO: Restaura o console.error original depois dos testes ---
    afterAll(() => {
        console.error.mockRestore();
    });

    beforeEach(() => {
        req = {
            companyId: 1,
            body: {},
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('addCollaborator', () => {
        it('deve adicionar um colaborador com sucesso (Status 201)', async () => {
            req.body = {
                first_name: 'João',
                last_name: 'Silva',
                email: 'joao@empresa.com',
                password: 'senhaForte123'
            };
            const mockNewId = 101;
            collaboratorsRepository.addCollaborator.mockResolvedValue(mockNewId);

            await collaboratorsController.addCollaborator(req, res);

            expect(collaboratorsRepository.addCollaborator).toHaveBeenCalledWith(req.body, req.companyId);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Colaborador adicionado com sucesso!',
                id: mockNewId
            });
        });

        it('deve retornar erro 500 se o repositório falhar', async () => {
            req.body = { email: 'erro@teste.com' };
            const mockError = new Error('Erro de conexão com banco');
            collaboratorsRepository.addCollaborator.mockRejectedValue(mockError);

            await collaboratorsController.addCollaborator(req, res);

            // O console.error será chamado aqui, mas não aparecerá no terminal
            expect(console.error).toHaveBeenCalled(); 
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao adicionar o colaborador.' });
        });
    });

    describe('getCollaborators', () => {
        it('deve retornar a lista de colaboradores (Status 200)', async () => {
            const mockList = [
                { id: 1, first_name: 'Ana', email: 'ana@teste.com' },
                { id: 2, first_name: 'Beto', email: 'beto@teste.com' }
            ];
            collaboratorsRepository.getCollaboratorsByCompanyId.mockResolvedValue(mockList);

            await collaboratorsController.getCollaborators(req, res);

            expect(collaboratorsRepository.getCollaboratorsByCompanyId).toHaveBeenCalledWith(req.companyId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockList);
        });

        it('deve retornar 500 se houver erro ao buscar', async () => {
            collaboratorsRepository.getCollaboratorsByCompanyId.mockRejectedValue(new Error('Falha DB'));

            await collaboratorsController.getCollaborators(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao buscar a lista de colaboradores.' });
        });
    });

    describe('deactivateCollaborator', () => {
        it('deve desativar um colaborador com sucesso (Status 200)', async () => {
            req.params.collaboratorId = 50;
            collaboratorsRepository.deactivateCollaborator.mockResolvedValue(true);

            await collaboratorsController.deactivateCollaborator(req, res);

            expect(collaboratorsRepository.deactivateCollaborator).toHaveBeenCalledWith(50);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Colaborador desativado com sucesso.' });
        });

        it('deve retornar 404 se o colaborador não for encontrado', async () => {
            req.params.collaboratorId = 999;
            collaboratorsRepository.deactivateCollaborator.mockResolvedValue(false);

            await collaboratorsController.deactivateCollaborator(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Colaborador não encontrado.' });
        });

        it('deve retornar 500 em caso de erro no servidor', async () => {
            req.params.collaboratorId = 50;
            collaboratorsRepository.deactivateCollaborator.mockRejectedValue(new Error('Erro grave'));

            await collaboratorsController.deactivateCollaborator(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao desativar o colaborador.' });
        });
    });
});