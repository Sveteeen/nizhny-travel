const categoriesService = require('../services/categoryService');

const getCategories = async (req, res, next) => {
    try {
        const result = await categoriesService.getAllCategories();
        return res.json(result);
    } catch (err) {
        return next(err);
    }    
};

module.exports = { getCategories };