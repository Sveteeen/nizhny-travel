const tagService = require('../services/tagService');

const getTags = async (req, res, next) => {
    try {
        const result = await tagService.getTags();
        return res.json(result);
    } catch (err) {
        return next(err);
    }
};

module.exports = { getTags };