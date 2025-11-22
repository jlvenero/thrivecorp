function getProfile(req, res) {
    res.json({
        message: 'Acesso autorizado!',
        user: req.user,
    });
}

module.exports = { getProfile };