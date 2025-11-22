const authorize = require('./authorizationMiddleware');

describe('Authorization Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    it('deve permitir se o papel bater', () => {
        req.user.role = 'admin';
        // Chama a função geradora com 'admin' e executa o middleware retornado
        authorize('admin')(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('deve negar (403) se o papel for diferente', () => {
        req.user.role = 'user';
        authorize('admin')(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar 401 se não houver usuário autenticado', () => {
        req.user = undefined;
        authorize('admin')(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });
});