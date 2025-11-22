const authController = require('./authController');
const authService = require('../services/authService');

jest.mock('../services/authService');

describe('Auth Controller', () => {
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
        req = { body: {}, user: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('Login', () => {
        it('deve logar com sucesso (200)', async () => {
            req.body = { email: 'a@b.com', password: '123' };
            const mockResult = { token: 'abc', user: { id: 1 } };
            authService.validateCredentialsAndGenerateToken.mockResolvedValue(mockResult);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        it('deve retornar 401 se credenciais inválidas', async () => {
            req.body = { email: 'a@b.com', password: 'wrong' };
            authService.validateCredentialsAndGenerateToken.mockResolvedValue(null);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'E-mail ou senha incorretos.' });
        });

        it('deve retornar 403 se conta pendente', async () => {
            req.body = { email: 'a@b.com', password: '123' };
            const error = new Error('Conta pendente de aprovação ou inativa.');
            authService.validateCredentialsAndGenerateToken.mockRejectedValue(error);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Sua conta ainda está em análise. Aguarde a aprovação do administrador.' });
        });

        it('deve retornar 500 para erro genérico', async () => {
            req.body = { email: 'a@b.com', password: '123' };
            authService.validateCredentialsAndGenerateToken.mockRejectedValue(new Error('Crash'));

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('Register (Internal)', () => {
        it('deve registrar (201)', async () => {
            req.body = { email: 'new@user.com' };
            authService.registerUser.mockResolvedValue(10);

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 10 }));
        });

        it('deve retornar 400 ao falhar', async () => {
            authService.registerUser.mockRejectedValue(new Error('Falha'));
            await authController.register(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('Change Password', () => {
        it('deve alterar senha (200)', async () => {
            req.user.userId = 1;
            req.body = { oldPassword: 'old', newPassword: 'new' };
            authService.changePassword.mockResolvedValue(true);

            await authController.changePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('deve retornar 400 se faltar dados', async () => {
            req.user.userId = 1;
            req.body = { oldPassword: 'old' }; // Falta newPassword

            await authController.changePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('deve retornar 400 se serviço falhar (ex: senha errada)', async () => {
            req.user.userId = 1;
            req.body = { oldPassword: 'wrong', newPassword: 'new' };
            authService.changePassword.mockRejectedValue(new Error('Senha incorreta'));

            await authController.changePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Senha incorreta' });
        });
    });

    describe('Submit Registration Request', () => {
        it('deve solicitar registro (201)', async () => {
            req.body = { email: 'solicita@teste.com' };
            authService.submitRegistrationRequest.mockResolvedValue(50);

            await authController.submitRegistrationRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('deve retornar 409 se email duplicado', async () => {
            req.body = { email: 'dup@teste.com' };
            authService.submitRegistrationRequest.mockRejectedValue(new Error('E-mail já cadastrado.'));

            await authController.submitRegistrationRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
        });

        it('deve retornar 500 para erro genérico', async () => {
            req.body = { email: 'erro@teste.com' };
            authService.submitRegistrationRequest.mockRejectedValue(new Error('Crash'));

            await authController.submitRegistrationRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});