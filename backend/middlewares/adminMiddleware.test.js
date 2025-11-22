const authorizeAdmin = require('./adminMiddleware');

describe('Admin Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    it('deve permitir se role for thrive_admin', () => {
        req.user.role = 'thrive_admin';
        authorizeAdmin(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('deve negar (403) se role não for thrive_admin', () => {
        req.user.role = 'user';
        authorizeAdmin(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve negar (403) se não houver usuário', () => {
        req.user = undefined;
        authorizeAdmin(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
    });
});