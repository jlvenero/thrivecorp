const checkGymDeletePermission = require('./permissionMiddleware');
const providersRepository = require('../models/providersRepository');

jest.mock('../models/providersRepository');

describe('Permission Middleware (Gym Delete)', () => {
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
        req = {
            params: { id: 10 }, // ID da academia
            user: { userId: 1, role: 'provider' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    it('deve retornar 404 se a academia não existir', async () => {
        providersRepository.getGymById.mockResolvedValue(null);

        await checkGymDeletePermission(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Academia não encontrada.' });
    });

    it('deve permitir (next) se o usuário for thrive_admin', async () => {
        req.user.role = 'thrive_admin';
        providersRepository.getGymById.mockResolvedValue({ id: 10, provider_id: 999 });

        await checkGymDeletePermission(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('deve permitir se o usuário for provider E dono da academia', async () => {
        req.user.role = 'provider';
        // A academia pertence ao provider 50
        providersRepository.getGymById.mockResolvedValue({ id: 10, provider_id: 50 });
        // O usuário logado (ID 1) é dono do provider 50
        providersRepository.getProviderByUserId.mockResolvedValue({ id: 50, user_id: 1 });

        await checkGymDeletePermission(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('deve negar (403) se o provider não for dono da academia', async () => {
        req.user.role = 'provider';
        providersRepository.getGymById.mockResolvedValue({ id: 10, provider_id: 50 });
        providersRepository.getProviderByUserId.mockResolvedValue({ id: 20 });

        await checkGymDeletePermission(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
            message: expect.stringContaining('Acesso negado') 
        }));
    });

    it('deve negar (403) se o provider não tiver registro de provider', async () => {
        req.user.role = 'provider';
        providersRepository.getGymById.mockResolvedValue({ id: 10, provider_id: 50 });
        providersRepository.getProviderByUserId.mockResolvedValue(null);

        await checkGymDeletePermission(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('deve retornar 500 em caso de erro no banco', async () => {
        providersRepository.getGymById.mockRejectedValue(new Error('Erro DB'));

        await checkGymDeletePermission(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});