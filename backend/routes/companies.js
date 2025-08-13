const express = require('express');
const router = express.Router();
const companiesController = require('../controllers/companiesController');
const authenticateToken = require('../middlewares/authMiddleware');

router.post('/', authenticateToken, companiesController.createCompany);

router.get('/:id', authenticateToken, companiesController.getCompany);

router.delete('/:id', authenticateToken, companiesController.deleteCompany);

module.exports = router;