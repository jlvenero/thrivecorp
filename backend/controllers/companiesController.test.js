const companiesController = require('./companiesController');
const companiesRepository = require('../models/companiesRepository');

// Mock do repositório
jest.mock('../models/companiesRepository');

describe('Companies Controller', () => {
    let req, res;

    // Silenciar logs durante os testes
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
            body: {},
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('createCompany', () => {
        it('deve criar uma empresa com sucesso (201)', async () => {
            req.body = {
                name: 'Empresa Teste',
                cnpj: '12345678901234',
                address: 'Rua Teste, 123',
                admin_id: 1
            };
            companiesRepository.createCompany.mockResolvedValue(123);

            await companiesController.createCompany(req, res);

            expect(companiesRepository.createCompany).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Empresa solicitada para registro com sucesso!',
                id: 123
            });
        });

        it('deve retornar 500 se o repositório falhar', async () => {
            req.body = { name: 'Erro' };
            companiesRepository.createCompany.mockRejectedValue(new Error('Falha no DB'));

            await companiesController.createCompany(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao solicitar registro da empresa.' });
        });
    });

    describe('getCompany', () => {
        it('deve retornar os dados da empresa se encontrada (200)', async () => {
            req.params.id = 10;
            const mockCompany = { id: 10, name: 'Tech Corp' };
            companiesRepository.getCompanyById.mockResolvedValue(mockCompany);

            await companiesController.getCompany(req, res);

            expect(companiesRepository.getCompanyById).toHaveBeenCalledWith(10);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockCompany);
        });

        it('deve retornar 404 se a empresa não existir', async () => {
            req.params.id = 999;
            companiesRepository.getCompanyById.mockResolvedValue(null);

            await companiesController.getCompany(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Empresa não encontrada.' });
        });

        it('deve retornar 500 em caso de erro', async () => {
            req.params.id = 10;
            companiesRepository.getCompanyById.mockRejectedValue(new Error('Erro'));

            await companiesController.getCompany(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao buscar a empresa.' });
        });
    });

    describe('getAllCompanies', () => {
        it('deve listar todas as empresas (200)', async () => {
            const mockList = [{ id: 1 }, { id: 2 }];
            companiesRepository.getAllCompanies.mockResolvedValue(mockList);

            await companiesController.getAllCompanies(req, res);

            expect(companiesRepository.getAllCompanies).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockList);
        });

        it('deve retornar 500 em caso de erro', async () => {
            companiesRepository.getAllCompanies.mockRejectedValue(new Error('Erro'));

            await companiesController.getAllCompanies(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao buscar a lista de empresas.' });
        });
    });

    describe('deleteCompany', () => {
        it('deve deletar empresa com sucesso (200)', async () => {
            req.params.id = 1;
            companiesRepository.deleteCompany.mockResolvedValue(true);

            await companiesController.deleteCompany(req, res);

            expect(companiesRepository.deleteCompany).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Empresa e usuário associado deletados com sucesso.' });
        });

        it('deve retornar 404 se a empresa não for encontrada', async () => {
            req.params.id = 999;
            companiesRepository.deleteCompany.mockResolvedValue(false);

            await companiesController.deleteCompany(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Empresa não encontrada para exclusão.' });
        });

        it('deve retornar 500 em caso de erro', async () => {
            req.params.id = 1;
            companiesRepository.deleteCompany.mockRejectedValue(new Error('Erro'));

            await companiesController.deleteCompany(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao excluir a empresa.' });
        });
    });

    describe('approveCompany', () => {
        it('deve aprovar empresa com sucesso (200)', async () => {
            req.params.id = 1;
            companiesRepository.approveCompany.mockResolvedValue(true);

            await companiesController.approveCompany(req, res);

            expect(companiesRepository.approveCompany).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Empresa e usuário associado aprovados com sucesso.' });
        });

        it('deve retornar 404 se não encontrar para aprovar', async () => {
            req.params.id = 999;
            companiesRepository.approveCompany.mockResolvedValue(false);

            await companiesController.approveCompany(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Empresa não encontrada para aprovação.' });
        });

        it('deve retornar 500 em caso de erro', async () => {
            req.params.id = 1;
            companiesRepository.approveCompany.mockRejectedValue(new Error('Erro'));

            await companiesController.approveCompany(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao aprovar a empresa.' });
        });
    });
});