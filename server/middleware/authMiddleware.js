const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    const header = req.headers.authorization || '';
    const [schema, token] = header.split(' ');

    if (schema !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Unauthorized'});
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.userId;
        req.roleId = payload.roleId;
        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Неправильный или истекший токен' });
    }
};

const optionalAuth = (req, res, next) => {
    const header = req.headers.authorization || '';
    const [schema, token] = header.split(' ');

    if (schema !== 'Bearer' || !token) {
        return next();
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.userId;
        req.roleId = payload.roleId;
    } catch {
        // Ignore invalid token for public endpoints that optionally use auth.
    }

    return next();
};

module.exports = { requireAuth, optionalAuth };