const authService = require('../services/authService');

const register = async (req, res, next) => {
    try {
        const { email, password, username, name, phone } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Введите почту и пароль.'});
        }

        const result = await authService.register({ email, password, username, name, phone });
        if (result.error) {
            return res.status(409).json({ error: result.error });
        }

        return res.status(201).json(result);
    } catch (error) {
        return next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Введите почту и пароль.'});
        }

        const result = await authService.login({ email, password });
        if (result.error) {
            return res.status(401).json({ error: result.error });
        }

        return res.json(result);
    } catch (error) {
        return next(error);
    }
};

const me = async (req, res, next) => {
    try {
        const user = await authService.getUserById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        return res.json(user);
    } catch (error) {
        return next(error);
    } 
};

const updateUser = async (req, res, next) => {
    try {
        const result = await authService.updateUser(req.userId, req.body);

        if (result.error) {
            return res.status(result.statusCode || 400).json({ error: result.error });
        }

        return res.json(result);
    } catch (error) {
        return next(error);
    }
};
module.exports = { login, register, me, updateUser };

