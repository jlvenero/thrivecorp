const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const accessController = require('../controllers/accessController');
const getProviderDetails = require('../middlewares/providerDetailsMiddleware');
const getCompanyDetails = require('../middlewares/companyDetailsMiddleware');

// Define as rotas
router.post('/', authenticateToken, accessController.recordAccess);
router.get('/provider-report', authenticateToken, getProviderDetails, accessController.getProviderAccessReport);
router.get('/company-report', authenticateToken, getCompanyDetails, accessController.getCompanyAccessReport);

// Exporta APENAS o router
module.exports = router;