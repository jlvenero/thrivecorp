const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');

// Rota protegida que só pode ser acessada com um token válido
router.get('/profile', authenticateToken, (req, res) => {
    // req.user contém os dados do usuário extraídos do token
    res.json({
        message: 'Acesso autorizado!',
        user: req.user,
    });
});

module.exports = router;