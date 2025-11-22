const authService = require('./authService');
const userRepository = require('../models/userRepository');
const registerRepository = require('../models/registerRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../models/userRepository');
jest.mock('../models/registerRepository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
    });

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
            bcrypt.compare.mockResolvedValue(false); // Senha errada

            const result = await authService.validateCredentialsAndGenerateToken('a@b.com', '123');
            expect(result).toBeNull();
        });

        it('deve retornar token e usuário se tudo estiver correto', async () => {
            const mockUser = { id: 1, email: 'a@b.com', role: 'admin', status: 'active', password: 'hash' };
            userRepository.findByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true); // Senha correta
            jwt.sign.mockReturnValue('fake-token');

            const result = await authService.validateCredentialsAndGenerateToken('a@b.com', '123');

            expect(result).toEqual({
                token: 'fake-token',
                user: { id: 1, email: 'a@b.com', role: 'admin' }
            });
        });
    });

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
            bcrypt.hash.mockResolvedValue('new-hash');
            userRepository.updatePassword.mockResolvedValue(true);

            const result = await authService.changePassword(1, 'correct', 'new');
            expect(userRepository.updatePassword).toHaveBeenCalledWith(1, 'new-hash');
            expect(result).toBe(true);
        });
    });
});