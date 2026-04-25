const { Router } = require('express');
const routeController = require('../controllers/routeController');

const router = Router();

router.get('/routes', routeController.getRoutes);
router.get('/routes/:id', routeController.getRouteById);

module.exports = router;
