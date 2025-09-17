// backend/routes/index.js
const express = require('express');
const router = express.Router();

const profileRoutes = require('./profile');
const providersRoutes = require('./providers');

// Monta as outras rotas dentro deste router principal
router.use(profileRoutes);
router.use(providersRoutes);

module.exports = router;