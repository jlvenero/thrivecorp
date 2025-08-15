function authorize(requiredRole) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Autenticação necessária.' });
        }
        if (req.user.role !== requiredRole) {
            return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para realizar esta ação.' });
        }
        next();
    };
}

module.exports = authorize;