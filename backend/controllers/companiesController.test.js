const companiesController = require('./companiesController');
const companiesRepository = require('../models/companiesRepository');

jest.mock('../models/companiesRepository');

describe('Companies Controller', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createCompany', () => {
        it('deve criar uma empresa com sucesso (status 201)', async () => {
            const req = {
                body: {
                    name: 'Empresa Teste',
                    cnpj: '12345678901234',
                    address: 'Rua Teste, 123',
                    admin_id: 1
                }
            };
            const res = { status: jest.fn(() => res), json: jest.fn() };

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
            const req = { body: {} };
            const res = { status: jest.fn(() => res), json: jest.fn() };

            const mockError = new Error('Falha no DB');
            companiesRepository.createCompany.mockRejectedValue(mockError);

            await companiesController.createCompany(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Erro ao solicitar registro da empresa.'
            });
        });
    });

    describe('deleteCompany (Reprovação/Exclusão)', () => {
        it('deve deletar empresa com sucesso e retornar 200', async () => {
            const req = { params: { id: 1 } };
            const res = { status: jest.fn(() => res), json: jest.fn() };

            companiesRepository.deleteCompany.mockResolvedValue(true);

            await companiesController.deleteCompany(req, res);

            expect(companiesRepository.deleteCompany).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Empresa e usuário associado deletados com sucesso.' });
        });

        it('deve retornar 404 se a empresa não for encontrada', async () => {
            const req = { params: { id: 999 } };
            const res = { status: jest.fn(() => res), json: jest.fn() };

            companiesRepository.deleteCompany.mockResolvedValue(false);

            await companiesController.deleteCompany(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Empresa não encontrada para exclusão.' });
        });
    });

    describe('approveCompany', () => {
        it('deve aprovar empresa com sucesso e retornar 200', async () => {
            const req = { params: { id: 1 } };
            const res = { status: jest.fn(() => res), json: jest.fn() };

            companiesRepository.approveCompany.mockResolvedValue(true);

            await companiesController.approveCompany(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Empresa e usuário associado aprovados com sucesso.' });
        });
    });
});