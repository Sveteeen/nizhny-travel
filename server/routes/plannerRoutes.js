const { Router } = require('express');
const plannerController = require('../controllers/plannerController');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = Router();

router.post('/planner/build', optionalAuth, plannerController.buildRoute);

module.exports = router;
