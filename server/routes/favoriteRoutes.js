const { Router } = require('express');
const favoriteController = require('../controllers/favoriteController');

const router = Router();

router.post('/favorite/:id', favoriteController.addPlaceToFavorites);
router.delete('/favorites/:placeId', favoriteController.removePlaceFromFavorites);
router.post('/favorite-route/:id', favoriteController.addRouteToFavorites);
router.delete('/favorite-routes/:routeId', favoriteController.removeRouteFromFavorites);

module.exports = router;
