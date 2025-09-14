const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Token não fornecido.' });
    }

    try {
        console.log('Middleware authenticateToken: Verificando token...'); // Adicione este log
        const user = jwt.verify(token, JWT_SECRET);
        console.log('Token válido. Usuário:', user); // E este
        req.user = user;
        next();
    } catch (err) {
        // Este bloco captura erros na verificação do token, como token expirado ou inválido
        console.error('Erro de autenticação:', err); // Adicione este log
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
}

module.exports = authenticateToken;