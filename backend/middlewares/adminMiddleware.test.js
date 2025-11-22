const authorizeAdmin = require('./adminMiddleware');

describe('Admin Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    it('deve permitir acesso se for thrive_admin', () => {
        req.user.role = 'thrive_admin';
        authorizeAdmin(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('deve negar acesso (403) se for outro papel', () => {
        req.user.role = 'provider';
        authorizeAdmin(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Acesso negado. Apenas administradores ThriveCorp podem realizar esta ação.' });
    });

    it('deve negar acesso (403) se não houver usuário', () => {
        req.user = undefined;
        authorizeAdmin(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
    });
});