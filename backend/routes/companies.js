const express = require('express');
const router = express.Router();
const companiesController = require('../controllers/companiesController');
const authenticateToken = require('../middlewares/authMiddleware');
const authorizeAdmin = require('../middlewares/adminMiddleware');

router.post('/', authenticateToken, companiesController.createCompany);
router.get('/', authenticateToken, authorize('thrive_admin'), companiesController.getCompany);
router.get('/:id', authenticateToken, companiesController.getCompany);
router.delete('/:id', authenticateToken, companiesController.deleteCompany);
router.put('/:id/approve', authenticateToken, authorizeAdmin, companiesController.approveCompany);

module.exports = router;