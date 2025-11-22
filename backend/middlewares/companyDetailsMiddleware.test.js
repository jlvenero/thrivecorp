const getCompanyDetails = require('./companyDetailsMiddleware');
const companiesRepository = require('../models/companiesRepository');

jest.mock('../models/companiesRepository');

describe('Company Details Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: { userId: 1 } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    it('deve popular req.companyId e chamar next', async () => {
        const mockCompany = { id: 50, name: 'Corp' };
        companiesRepository.getCompanyByAdminId.mockResolvedValue(mockCompany);

        await getCompanyDetails(req, res, next);

        expect(req.companyId).toBe(50);
        expect(next).toHaveBeenCalled();
    });

    it('deve retornar 404 se empresa não encontrada', async () => {
        companiesRepository.getCompanyByAdminId.mockResolvedValue(null);
        await getCompanyDetails(req, res, next);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('deve retornar 500 se houver erro', async () => {
        companiesRepository.getCompanyByAdminId.mockRejectedValue(new Error('Erro'));
        await getCompanyDetails(req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});