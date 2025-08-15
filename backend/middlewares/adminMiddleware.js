function authorizeAdmin(req, res, next) {
    if (req.user && req.user.role === 'thrive_admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acesso negado. Apenas administradores ThriveCorp podem realizar esta ação.' });
    }
}

module.exports = authorizeAdmin;