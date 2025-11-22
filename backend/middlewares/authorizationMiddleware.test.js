const authorize = require('./authorizationMiddleware');

describe('Authorization Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    it('deve permitir acesso se o usuário tiver o papel correto', () => {
        req.user.role = 'admin';
        const middleware = authorize('admin');
        middleware(req, res, next);
        expect(next).toHaveBeenCalled();
    });
    
    it('deve negar acesso (403) se o papel não corresponder', () => {
        req.user.role = 'user';
        const middleware = authorize('admin');
        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ 
            message: 'Acesso negado. Você não tem permissão para realizar esta ação.' 
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('deve negar acesso (401) se usuário não estiver autenticado', () => {
        req.user = undefined;
        const middleware = authorize('admin');
        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });
});