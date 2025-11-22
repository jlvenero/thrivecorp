const profileController = require('./profileController');

describe('Profile Controller', () => {
    it('deve retornar os dados do perfil do usuário autenticado com status 200 implícito', () => {
        const req = {
            user: {
                userId: 1,
                email: 'teste@thrive.com',
                role: 'admin'
            }
        };

        const res = {
            json: jest.fn()
        };

        profileController.getProfile(req, res);

        expect(res.json).toHaveBeenCalledWith({
            message: 'Acesso autorizado!',
            user: req.user
        });
    });
});