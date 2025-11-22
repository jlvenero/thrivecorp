const adminController = require('./adminController');
const userRepository = require('../models/userRepository');
const bcrypt = require('bcryptjs');

// Mocks
jest.mock('../models/userRepository');
jest.mock('bcryptjs');

describe('Admin Controller', () => {
    let req, res;

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        console.error.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('createThriveAdmin', () => {
        it('deve criar um admin com sucesso (201)', async () => {
            req.body = {
                first_name: 'Super',
                last_name: 'Admin',
                email: 'admin@thrive.com',
                password: 'securepass'
            };

            // Mock: Email não existe
            userRepository.findByEmail.mockResolvedValue(null);
            // Mock: Hash da senha
            bcrypt.hash.mockResolvedValue('hashed_password_123');
            // Mock: Criação retorna ID 1
            userRepository.createUser.mockResolvedValue(1);

            await adminController.createThriveAdmin(req, res);

            expect(userRepository.findByEmail).toHaveBeenCalledWith('admin@thrive.com');
            expect(bcrypt.hash).toHaveBeenCalledWith('securepass', 10);
            // Verifica se o objeto passado para createUser tem o papel correto
            expect(userRepository.createUser).toHaveBeenCalledWith(expect.objectContaining({
                role: 'thrive_admin',
                status: 'active',
                password: 'hashed_password_123'
            }));
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Novo administrador ThriveCorp criado com sucesso!', id: 1 });
        });

        it('deve retornar 400 se campos obrigatórios faltarem', async () => {
            req.body = { email: 'admin@thrive.com' }; // Falta senha e nomes

            await adminController.createThriveAdmin(req, res);

            expect(userRepository.createUser).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Todos os campos são obrigatórios.' });
        });

        it('deve retornar 409 se o email já estiver em uso', async () => {
            req.body = {
                first_name: 'A', last_name: 'B',
                email: 'existente@thrive.com', password: '123'
            };

            // Mock: Email encontrado
            userRepository.findByEmail.mockResolvedValue({ id: 99 });

            await adminController.createThriveAdmin(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ error: 'O e-mail já está em uso.' });
        });

        it('deve retornar 500 em caso de erro interno', async () => {
            req.body = {
                first_name: 'A', last_name: 'B',
                email: 'novo@thrive.com', password: '123'
            };
            
            userRepository.findByEmail.mockRejectedValue(new Error('Erro DB'));

            await adminController.createThriveAdmin(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erro no servidor ao criar novo administrador.' });
        });
    });
});