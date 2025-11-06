// backend/controllers/authController.test.js

const authController = require('./authController');
const authService = require('../services/authService');

// Simula o authService
jest.mock('../services/authService');

describe('Auth Controller - Login', () => {

    it('deve retornar 200 e um token para credenciais válidas', async () => {
        // Prepara os mocks
        const mockToken = { token: 'fake-jwt-token', user: { id: 1, role: 'company_admin' } };
        authService.validateCredentialsAndGenerateToken.mockResolvedValue(mockToken);

        // Prepara objetos mockados de req (requisição) e res (resposta)
        const req = {
            body: {
                email: 'test@company.com',
                password: 'password123'
            }
        };
        // Mock das funções de resposta do Express
        const res = {
            status: jest.fn(() => res), // Permite encadeamento (res.status(200).json(...))
            json: jest.fn()
        };

        // Executa a função do controlador
        await authController.login(req, res);

        // Verifica se o serviço foi chamado corretamente
        expect(authService.validateCredentialsAndGenerateToken).toHaveBeenCalledWith('test@company.com', 'password123');
        // Verifica se a resposta foi enviada corretamente
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockToken);
    });

    it('deve retornar 401 para credenciais inválidas', async () => {
        // O serviço retorna null para credenciais inválidas
        authService.validateCredentialsAndGenerateToken.mockResolvedValue(null);

        const req = { body: { email: 'wrong@user.com', password: 'wrongpassword' } };
        const res = { status: jest.fn(() => res), json: jest.fn() };

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'E-mail ou senha incorretos.' });
    });
});