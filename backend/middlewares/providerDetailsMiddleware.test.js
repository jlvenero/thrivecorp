const getProviderDetails = require('./providerDetailsMiddleware');
const providersRepository = require('../models/providersRepository');

jest.mock('../models/providersRepository');

describe('Provider Details Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: { userId: 1 } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    it('deve popular req.provider e chamar next', async () => {
        const mockProvider = { id: 10, name: 'Prov' };
        providersRepository.getProviderByUserId.mockResolvedValue(mockProvider);

        await getProviderDetails(req, res, next);

        expect(req.provider).toEqual(mockProvider);
        expect(next).toHaveBeenCalled();
    });

    it('deve retornar 404 se provider não encontrado', async () => {
        providersRepository.getProviderByUserId.mockResolvedValue(null);
        await getProviderDetails(req, res, next);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('deve retornar 500 se houver erro', async () => {
        providersRepository.getProviderByUserId.mockRejectedValue(new Error('Erro'));
        await getProviderDetails(req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});