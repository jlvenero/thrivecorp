const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');

router.get('/profile', authenticateToken, (req, res) => {
    res.json({
        message: 'Acesso autorizado!',
        user: req.user,
    });
});

module.exports = router;