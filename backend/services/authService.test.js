const authService = require('./authService');
const userRepository = require('../models/userRepository');
const registerRepository = require('../models/registerRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Mocks das dependências
jest.mock('../models/userRepository');
jest.mock('../models/registerRepository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Mock do Logger (Essencial para validar se os logs estão sendo chamados)
jest.mock('../utils/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

describe('Auth Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
        // Garante que o hash sempre retorne um valor fixo nos testes
        bcrypt.hash.mockResolvedValue('hashed_password');
    });

    // --- TESTES DE LOGIN ---
    describe('validateCredentialsAndGenerateToken', () => {
        it('deve retornar null e logar aviso se usuário não existir', async () => {
            userRepository.findByEmail.mockResolvedValue(null);
            
            const result = await authService.validateCredentialsAndGenerateToken('naoexiste@b.com', '123');
            
            expect(result).toBeNull();
            // Valida log de segurança
            expect(logger.warn).toHaveBeenCalledWith(
                'Tentativa de login com e-mail inexistente', 
                { email: 'naoexiste@b.com' }
            );
        });

        it('deve lançar erro e logar aviso se conta não estiver ativa', async () => {
            userRepository.findByEmail.mockResolvedValue({ email: 'pendente@b.com', status: 'pending' });
            
            await expect(authService.validateCredentialsAndGenerateToken('pendente@b.com', '123'))
                .rejects.toThrow('Conta pendente de aprovação ou inativa.');

            // Valida log de status inválido
            expect(logger.warn).toHaveBeenCalledWith(
                'Tentativa de login em conta inativa ou pendente', 
                { email: 'pendente@b.com', status: 'pending' }
            );
        });

        it('deve retornar null e logar aviso se senha for inválida', async () => {
            userRepository.findByEmail.mockResolvedValue({ email: 'a@b.com', status: 'active', password: 'hash' });
            bcrypt.compare.mockResolvedValue(false); // Senha errada
            
            const result = await authService.validateCredentialsAndGenerateToken('a@b.com', 'errada');
            
            expect(result).toBeNull();
            // Valida log de falha de senha (força bruta)
            expect(logger.warn).toHaveBeenCalledWith(
                'Tentativa de login com senha incorreta', 
                { email: 'a@b.com' }
            );
        });

        it('deve retornar token e logar sucesso se tudo estiver correto', async () => {
            const mockUser = { id: 1, email: 'a@b.com', role: 'admin', status: 'active', password: 'hash' };
            userRepository.findByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('fake-token');

            const result = await authService.validateCredentialsAndGenerateToken('a@b.com', '123');

            expect(result).toEqual({
                token: 'fake-token',
                user: { id: 1, email: 'a@b.com', role: 'admin' }
            });
            
            // Valida log de auditoria de sucesso
            expect(logger.info).toHaveBeenCalledWith(
                'Login realizado com sucesso', 
                expect.objectContaining({ userId: 1, email: 'a@b.com' })
            );
        });
    });

    // --- TESTES DE REGISTRO INTERNO (registerUser) ---
    describe('registerUser', () => {
        it('deve registrar usuário, hashear senha e logar sucesso', async () => {
            userRepository.findByEmail.mockResolvedValue(null);
            userRepository.createUser.mockResolvedValue(10);

            const userData = { email: 'novo@interno.com', password: '123', role: 'admin' };
            const result = await authService.registerUser(userData);

            expect(bcrypt.hash).toHaveBeenCalledWith('123', 10);
            expect(userRepository.createUser).toHaveBeenCalledWith(expect.objectContaining({
                email: 'novo@interno.com',
                password: 'hashed_password'
            }));
            
            // Valida log de criação interna
            expect(logger.info).toHaveBeenCalledWith(
                'Novo usuário registrado internamente',
                expect.objectContaining({ email: 'novo@interno.com', newUserId: 10 })
            );
            expect(result).toBe(10);
        });

        it('deve lançar erro e logar aviso se e-mail já existir', async () => {
            userRepository.findByEmail.mockResolvedValue({ id: 1 });
            
            await expect(authService.registerUser({ email: 'existe@teste.com' }))
                .rejects.toThrow('E-mail já cadastrado.');

            expect(logger.warn).toHaveBeenCalledWith(
                'Tentativa de registro interno com e-mail duplicado',
                { email: 'existe@teste.com' }
            );
        });
    });

    // --- TESTES DE REGISTRO PÚBLICO (submitRegistrationRequest) ---
    describe('submitRegistrationRequest', () => {
        it('deve lançar erro e logar aviso se email já existe', async () => {
            userRepository.findByEmail.mockResolvedValue({ id: 1 });
            
            await expect(authService.submitRegistrationRequest({ email: 'existe@teste.com' }))
                .rejects.toThrow('E-mail já cadastrado.');

            expect(logger.warn).toHaveBeenCalledWith(
                'Tentativa de cadastro com e-mail já existente',
                { email: 'existe@teste.com' }
            );
        });

        it('deve chamar repository e logar sucesso se email for novo', async () => {
            userRepository.findByEmail.mockResolvedValue(null);
            registerRepository.registerUserAndEntity.mockResolvedValue(55);

            const result = await authService.submitRegistrationRequest({ email: 'novo@teste.com', role: 'gym' });
            
            expect(result).toBe(55);
            
            expect(logger.info).toHaveBeenCalledWith(
                'Solicitação de registro enviada',
                expect.objectContaining({ email: 'novo@teste.com', newUserId: 55 })
            );
        });
    });

    // --- TESTES DE TROCA DE SENHA ---
    describe('changePassword', () => {
        it('deve lançar erro e logar erro se usuário não encontrado', async () => {
            userRepository.findById.mockResolvedValue(null);
            
            await expect(authService.changePassword(99, 'old', 'new'))
                .rejects.toThrow('Usuário não encontrado.');

            // Aqui usamos logger.error pois é um estado inconsistente (tentar trocar senha de user null)
            expect(logger.error).toHaveBeenCalledWith(
                'Tentativa de troca de senha para usuário não encontrado',
                { userId: 99 }
            );
        });

        it('deve lançar erro e logar aviso se senha antiga incorreta', async () => {
            userRepository.findById.mockResolvedValue({ id: 1, email: 'a@b.com', password: 'hash' });
            bcrypt.compare.mockResolvedValue(false);
            
            await expect(authService.changePassword(1, 'wrong', 'new'))
                .rejects.toThrow('A senha antiga está incorreta.');

            expect(logger.warn).toHaveBeenCalledWith(
                'Falha na troca de senha: senha antiga incorreta',
                { userId: 1, email: 'a@b.com' }
            );
        });

        it('deve atualizar senha e logar auditoria se tudo correto', async () => {
            const mockUser = { id: 1, email: 'teste@thrive.com', password: 'hash' };
            
            userRepository.findById.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            userRepository.updatePassword.mockResolvedValue(true);

            const result = await authService.changePassword(1, 'correct', 'new');
            
            expect(userRepository.updatePassword).toHaveBeenCalledWith(1, 'hashed_password');
            expect(result).toBe(true);

            // Valida log de sucesso da troca
            expect(logger.info).toHaveBeenCalledWith(
                'Senha alterada com sucesso', 
                { userId: 1, email: 'teste@thrive.com' }
            );
        });
    });
});