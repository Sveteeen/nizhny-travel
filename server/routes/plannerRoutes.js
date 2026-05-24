const { Router } = require('express');
const plannerController = require('../controllers/plannerController');
const { optionalAuth, requireAuth } = require('../middleware/authMiddleware');

const router = Router();

router.post('/planner/build', optionalAuth, plannerController.buildRoute);
router.post('/planner/routes', requireAuth, plannerController.saveRoute);
router.get('/planner/routes', requireAuth, plannerController.listSavedRoutes);
router.get('/planner/routes/:id', requireAuth, plannerController.getSavedRoute);
router.delete('/planner/routes/:id', requireAuth, plannerController.deleteSavedRoute);

module.exports = router;
