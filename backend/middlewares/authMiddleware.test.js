const authenticateToken = require('./authMiddleware');
const jwt = require('jsonwebtoken');

// Mock da biblioteca jsonwebtoken
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
    let req, res, next;

    // --- Silencia logs no terminal durante os testes ---
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterAll(() => {
        console.error.mockRestore();
        console.log.mockRestore();
    });
    // ---------------------------------------------------

    beforeEach(() => {
        req = { headers: {} };
        res = {
            status: jest.fn().mockReturnThis(), // Permite encadear .status().json()
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('deve retornar 401 se o header Authorization não for fornecido', () => {
        // Act
        authenticateToken(req, res, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token não fornecido.' });
        expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar 401 se o header existir mas estiver incompleto', () => {
        // Arrange: Envia "Bearer" sem espaço e sem token.
        // Isso faz o split(' ')[1] ser undefined, acionando a verificação (token == null)
        req.headers['authorization'] = 'Bearer'; 
        
        // Act
        authenticateToken(req, res, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve chamar next() e popular req.user se o token for válido', () => {
        // Arrange
        const token = 'token.valido.jwt';
        req.headers['authorization'] = `Bearer ${token}`;
        
        const mockDecodedUser = { userId: 1, role: 'admin' };
        jwt.verify.mockReturnValue(mockDecodedUser); 

        // Act
        authenticateToken(req, res, next);

        // Assert
        expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
        expect(req.user).toEqual(mockDecodedUser);
        expect(next).toHaveBeenCalled();
    });

    it('deve retornar 403 se o token for inválido ou expirado', () => {
        // Arrange
        req.headers['authorization'] = 'Bearer token_invalido';
        
        // Simula erro ao verificar token
        jwt.verify.mockImplementation(() => {
            throw new Error('jwt expired');
        });

        // Act
        authenticateToken(req, res, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido ou expirado.' });
        expect(next).not.toHaveBeenCalled();
    });
});