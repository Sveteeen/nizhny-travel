const { Router } = require("express");
const categoriesController = require('../controllers/categoryController');

const router = Router();

router.get('/category', categoriesController.getCategories);

module.exports = router;