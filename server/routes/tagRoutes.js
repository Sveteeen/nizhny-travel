const { Router } = require("express");
const tagController = require('../controllers/tagController');

const router = Router();

router.get('/tag', tagController.getTags);

module.exports = router;