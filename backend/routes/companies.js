const express = require('express');
const router = express.Router();
const companiesController = require('../controllers/companiesController');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeAdmin = require('../middlewares/adminMiddleware');
const authorize = require('../middlewares/authorizationMiddleware')

router.post('/', authenticateToken, companiesController.createCompany);
router.get('/', authenticateToken, authorize('thrive_admin'), companiesController.getAllCompanies);
router.get('/:id', authenticateToken, companiesController.getCompany);
router.delete('/:id', authenticateToken, authorize('thrive_admin'), companiesController.deleteCompany);
router.put('/:id/approve', authenticateToken, authorizeAdmin, companiesController.approveCompany);

module.exports = router;