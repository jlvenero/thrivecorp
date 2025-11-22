const authService = require('./authService');
const userRepository = require('../models/userRepository');
const registerRepository = require('../models/registerRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mocks
jest.mock('../models/userRepository');
jest.mock('../models/registerRepository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
        // Garante que o hash retorne algo
        bcrypt.hash.mockResolvedValue('hashed_password');
    });

    // --- TESTES DE LOGIN (Já existiam) ---
    describe('validateCredentialsAndGenerateToken', () => {
        it('deve retornar null se usuário não existir', async () => {
            userRepository.findByEmail.mockResolvedValue(null);
            const result = await authService.validateCredentialsAndGenerateToken('a@b.com', '123');
            expect(result).toBeNull();
        });

        it('deve lançar erro se conta não estiver ativa', async () => {
            userRepository.findByEmail.mockResolvedValue({ status: 'pending' });
            await expect(authService.validateCredentialsAndGenerateToken('a@b.com', '123'))
                .rejects.toThrow('Conta pendente de aprovação ou inativa.');
        });

        it('deve retornar null se senha for inválida', async () => {
            userRepository.findByEmail.mockResolvedValue({ status: 'active', password: 'hash' });
            bcrypt.compare.mockResolvedValue(false);
            const result = await authService.validateCredentialsAndGenerateToken('a@b.com', '123');
            expect(result).toBeNull();
        });

        it('deve retornar token e usuário se tudo estiver correto', async () => {
            const mockUser = { id: 1, email: 'a@b.com', role: 'admin', status: 'active', password: 'hash' };
            userRepository.findByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('fake-token');

            const result = await authService.validateCredentialsAndGenerateToken('a@b.com', '123');

            expect(result).toEqual({
                token: 'fake-token',
                user: { id: 1, email: 'a@b.com', role: 'admin' }
            });
        });
    });

    // --- TESTES NOVOS PARA COBRIR LINHAS 44-56 (registerUser) ---
    describe('registerUser', () => {
        it('deve registrar usuário com hash de senha', async () => {
            // Mock: Email não existe
            userRepository.findByEmail.mockResolvedValue(null);
            // Mock: Criação retorna ID 10
            userRepository.createUser.mockResolvedValue(10);

            const userData = { email: 'novo@interno.com', password: '123', role: 'admin' };
            const result = await authService.registerUser(userData);

            expect(userRepository.findByEmail).toHaveBeenCalledWith('novo@interno.com');
            expect(bcrypt.hash).toHaveBeenCalledWith('123', 10);
            expect(userRepository.createUser).toHaveBeenCalledWith(expect.objectContaining({
                email: 'novo@interno.com',
                password: 'hashed_password' // Verifica se a senha foi substituída pelo hash
            }));
            expect(result).toBe(10);
        });

        it('deve lançar erro se e-mail já existir', async () => {
            userRepository.findByEmail.mockResolvedValue({ id: 1 });
            await expect(authService.registerUser({ email: 'existe@teste.com' }))
                .rejects.toThrow('E-mail já cadastrado.');
        });
    });

    // --- TESTES DE REGISTRO PÚBLICO ---
    describe('submitRegistrationRequest', () => {
        it('deve lançar erro se email já existe', async () => {
            userRepository.findByEmail.mockResolvedValue({ id: 1 });
            await expect(authService.submitRegistrationRequest({ email: 'existe@teste.com' }))
                .rejects.toThrow('E-mail já cadastrado.');
        });

        it('deve chamar repository se email for novo', async () => {
            userRepository.findByEmail.mockResolvedValue(null);
            registerRepository.registerUserAndEntity.mockResolvedValue(10);

            const result = await authService.submitRegistrationRequest({ email: 'novo@teste.com' });
            expect(result).toBe(10);
        });
    });

    // --- TESTES DE TROCA DE SENHA ---
    describe('changePassword', () => {
        it('deve lançar erro se usuário não encontrado', async () => {
            userRepository.findById.mockResolvedValue(null);
            await expect(authService.changePassword(1, 'old', 'new'))
                .rejects.toThrow('Usuário não encontrado.');
        });

        it('deve lançar erro se senha antiga incorreta', async () => {
            userRepository.findById.mockResolvedValue({ password: 'hash' });
            bcrypt.compare.mockResolvedValue(false);
            await expect(authService.changePassword(1, 'wrong', 'new'))
                .rejects.toThrow('A senha antiga está incorreta.');
        });

        it('deve atualizar senha se tudo correto', async () => {
            userRepository.findById.mockResolvedValue({ password: 'hash' });
            bcrypt.compare.mockResolvedValue(true);
            userRepository.updatePassword.mockResolvedValue(true);

            const result = await authService.changePassword(1, 'correct', 'new');
            expect(userRepository.updatePassword).toHaveBeenCalledWith(1, 'hashed_password');
            expect(result).toBe(true);
        });
    });
});