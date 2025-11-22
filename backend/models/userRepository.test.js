const userRepository = require('./userRepository');
const mysql = require('mysql2/promise');

jest.mock('mysql2/promise');

describe('User Repository', () => {
    // Mocks das funções da conexão
    const mockExecute = jest.fn();
    const mockEnd = jest.fn();

    beforeAll(() => {
        // Silencia logs
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Configura o mock do createConnection para retornar nosso objeto mockado
        mysql.createConnection.mockResolvedValue({
            execute: mockExecute,
            end: mockEnd
        });
    });

    describe('findByEmail', () => {
        it('deve retornar o usuário se encontrado', async () => {
            const mockUser = { id: 1, email: 'teste@teste.com' };
            // O mysql2 retorna um array [rows, fields], por isso [[mockUser]]
            mockExecute.mockResolvedValue([[mockUser]]);

            const result = await userRepository.findByEmail('teste@teste.com');

            expect(mockExecute).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM users WHERE email = ?'),
                ['teste@teste.com']
            );
            expect(result).toEqual(mockUser);
            expect(mockEnd).toHaveBeenCalled();
        });

        it('deve retornar null se não encontrar', async () => {
            mockExecute.mockResolvedValue([[]]); // Array vazio

            const result = await userRepository.findByEmail('naoexiste@teste.com');

            expect(result).toBeNull();
        });
    });

    describe('findById', () => {
        it('deve retornar o usuário por ID', async () => {
            const mockUser = { id: 1, name: 'User' };
            mockExecute.mockResolvedValue([[mockUser]]);

            const result = await userRepository.findById(1);

            expect(result).toEqual(mockUser);
        });

        it('deve retornar null se ID não existir', async () => {
            mockExecute.mockResolvedValue([[]]);
            const result = await userRepository.findById(999);
            expect(result).toBeNull();
        });
    });

    describe('createUser', () => {
        it('deve inserir usuário e retornar o ID', async () => {
            const mockResult = { insertId: 10 };
            mockExecute.mockResolvedValue([mockResult]);

            const userData = {
                email: 'novo@teste.com',
                password: 'hash',
                role: 'admin',
                first_name: 'Novo',
                last_name: 'User',
                status: 'active'
            };

            const result = await userRepository.createUser(userData);

            expect(mockExecute).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO users'),
                expect.arrayContaining(['novo@teste.com', 'hash', 'admin', 'active'])
            );
            expect(result).toBe(10);
        });
    });

    describe('updatePassword', () => {
        it('deve retornar true se atualizar senha', async () => {
            mockExecute.mockResolvedValue([{ affectedRows: 1 }]);
            const result = await userRepository.updatePassword(1, 'newhash');
            expect(result).toBe(true);
        });

        it('deve retornar false se não encontrar usuário', async () => {
            mockExecute.mockResolvedValue([{ affectedRows: 0 }]);
            const result = await userRepository.updatePassword(999, 'newhash');
            expect(result).toBe(false);
        });
    });
});