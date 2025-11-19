const authController = require('./authController');
const authService = require('../services/authService');

jest.mock('../services/authService');

describe('Auth Controller', () => {
    let consoleSpy;

    beforeAll(() => {
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        consoleSpy.mockRestore();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Login', () => {
        it('deve retornar 200 e um token para credenciais válidas', async () => {
            const mockToken = { token: 'fake-jwt-token', user: { id: 1, role: 'company_admin' } };
            authService.validateCredentialsAndGenerateToken.mockResolvedValue(mockToken);

            const req = { body: { email: 'test@company.com', password: 'password123' } };
            const res = { status: jest.fn(() => res), json: jest.fn() };

            await authController.login(req, res);

            expect(authService.validateCredentialsAndGenerateToken).toHaveBeenCalledWith('test@company.com', 'password123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockToken);
        });

        it('deve retornar 401 para credenciais inválidas', async () => {
            authService.validateCredentialsAndGenerateToken.mockResolvedValue(null);

            const req = { body: { email: 'wrong@user.com', password: 'wrongpassword' } };
            const res = { status: jest.fn(() => res), json: jest.fn() };

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'E-mail ou senha incorretos.' });
        });

        it('deve retornar 403 se a conta estiver pendente ou inativa', async () => {
            const error = new Error('Conta pendente de aprovação ou inativa.');
            authService.validateCredentialsAndGenerateToken.mockRejectedValue(error);

            const req = { body: { email: 'pending@user.com', password: 'password123' } };
            const res = { status: jest.fn(() => res), json: jest.fn() };

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Sua conta ainda está em análise. Aguarde a aprovação do administrador.' });
        });

        it('deve retornar 500 para erro genérico no login', async () => {
            const error = new Error('Erro desconhecido');
            authService.validateCredentialsAndGenerateToken.mockRejectedValue(error);

            const req = { body: { email: 'error@user.com', password: 'password123' } };
            const res = { status: jest.fn(() => res), json: jest.fn() };

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno no servidor ao tentar realizar o login.' });
        });
    });

    describe('Register (Internal)', () => {
        it('deve registrar usuário com sucesso (201)', async () => {
            authService.registerUser.mockResolvedValue(5);

            const req = { body: { email: 'new@user.com', password: '123', role: 'admin' } };
            const res = { status: jest.fn(() => res), json: jest.fn() };

            await authController.register(req, res);

            expect(authService.registerUser).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Usuário registrado com sucesso!', id: 5 });
        });

        it('deve retornar 400 se houver erro no registro', async () => {
            authService.registerUser.mockRejectedValue(new Error('Dados inválidos'));

            const req = { body: { email: 'invalid' } };
            const res = { status: jest.fn(() => res), json: jest.fn() };

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Dados inválidos' });
        });
    });

    describe('Change Password', () => {
        it('deve alterar a senha com sucesso (200)', async () => {
            authService.changePassword.mockResolvedValue(true);

            const req = { 
                user: { userId: 1 }, 
                body: { oldPassword: 'old', newPassword: 'new' } 
            };
            const res = { status: jest.fn(() => res), json: jest.fn() };

            await authController.changePassword(req, res);

            expect(authService.changePassword).toHaveBeenCalledWith(1, 'old', 'new');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Senha alterada com sucesso.' });
        });

        it('deve retornar 400 se faltar senha antiga ou nova', async () => {
            const req = { user: { userId: 1 }, body: { oldPassword: '' } };
            const res = { status: jest.fn(() => res), json: jest.fn() };

            await authController.changePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Senha antiga e nova senha são obrigatórias.' });
        });

        it('deve retornar 400 se o serviço lançar erro (ex: senha incorreta)', async () => {
            authService.changePassword.mockRejectedValue(new Error('A senha antiga está incorreta.'));

            const req = { 
                user: { userId: 1 }, 
                body: { oldPassword: 'wrong', newPassword: 'new' } 
            };
            const res = { status: jest.fn(() => res), json: jest.fn() };

            await authController.changePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'A senha antiga está incorreta.' });
        });
    });

    describe('Submit Registration Request', () => {
        it('deve retornar 201 e registrar solicitação com sucesso', async () => {
            authService.submitRegistrationRequest.mockResolvedValue(10);

            const req = {
                body: {
                    email: 'new@company.com',
                    password: 'pass',
                    role: 'company_admin'
                }
            };
            const res = { status: jest.fn(() => res), json: jest.fn() };

            await authController.submitRegistrationRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Registro enviado com sucesso! Aguarde a aprovação.',
                id: 10
            }));
        });

        it('deve retornar 409 se o e-mail já estiver cadastrado', async () => {
            const error = new Error('E-mail já cadastrado.');
            authService.submitRegistrationRequest.mockRejectedValue(error);

            const req = { body: { email: 'duplicate@email.com' } };
            const res = { status: jest.fn(() => res), json: jest.fn() };

            await authController.submitRegistrationRequest(req, res);

            expect(consoleSpy).toHaveBeenCalled(); 
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ error: 'Este e-mail já está cadastrado no sistema.' });
        });

        it('deve retornar 500 para outros erros genéricos', async () => {
            const error = new Error('Erro de banco de dados');
            authService.submitRegistrationRequest.mockRejectedValue(error);

            const req = { body: { email: 'error@email.com' } };
            const res = { status: jest.fn(() => res), json: jest.fn() };

            await authController.submitRegistrationRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao processar o registro.' });
        });
    });
});