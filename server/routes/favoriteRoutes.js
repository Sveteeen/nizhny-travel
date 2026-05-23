const { Router } = require('express');
const favoriteController = require('../controllers/favoriteController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = Router();

router.post('/favorite/:id', requireAuth, favoriteController.addPlaceToFavorites);
router.delete('/favorites/:placeId', requireAuth, favoriteController.removePlaceFromFavorites);
router.post('/favorite-route/:id', requireAuth, favoriteController.addRouteToFavorites);
router.delete('/favorite-routes/:routeId', requireAuth, favoriteController.removeRouteFromFavorites);
router.get('/favorites/places', requireAuth, favoriteController.getFavouritePlaces);
router.get('/favorites/routes', requireAuth, favoriteController.getFavouriteRoutes);

module.exports = router;
