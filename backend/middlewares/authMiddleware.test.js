const authenticateToken = require('./authMiddleware');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
    let req, res, next;

    beforeAll(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        req = { headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    it('deve retornar 401 se não houver header de autorização', () => {
        authenticateToken(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token não fornecido.' });
        expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar 401 se o token estiver vazio ou malformado', () => {
        req.headers['authorization'] = 'Bearer'; // Sem token
        authenticateToken(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('deve chamar next() e popular req.user se token for válido', () => {
        req.headers['authorization'] = 'Bearer token_valido';
        const mockUser = { userId: 1, role: 'admin' };
        jwt.verify.mockReturnValue(mockUser);

        authenticateToken(req, res, next);

        expect(jwt.verify).toHaveBeenCalled();
        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalled();
    });

    it('deve retornar 403 se o token for inválido', () => {
        req.headers['authorization'] = 'Bearer token_invalido';
        jwt.verify.mockImplementation(() => { throw new Error('Inválido'); });

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido ou expirado.' });
    });
});