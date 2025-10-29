const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const accessController = require('../controllers/accessController');
const getProviderDetails = require('../middlewares/providerDetailsMiddleware');
const getCompanyDetails = require('../middlewares/companyDetailsMiddleware');
const authorize = require('../middlewares/authorizationMiddleware');

router.post('/', authenticateToken, accessController.recordAccess);
router.get('/provider-report', authenticateToken, getProviderDetails, accessController.getProviderAccessReport);
router.get('/company-report', authenticateToken, getCompanyDetails, accessController.getCompanyAccessReport);

router.get('/billing-report', authenticateToken, authorize('thrive_admin'), accessController.getMonthlyBillingReport);
router.get('/company-details-report', authenticateToken, getCompanyDetails, accessController.getCompanyAccessDetails);

router.get('/download-company-report', authenticateToken, getCompanyDetails, accessController.downloadCompanyAccessReport);
router.get('/download-billing-report', authenticateToken, authorize('thrive_admin'), accessController.downloadBillingReport);


module.exports = router;