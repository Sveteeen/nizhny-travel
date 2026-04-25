const { Router } = require('express');
const placeController = require('../controllers/placeController');

const router = Router();

router.get('/places', placeController.getPlaces);
router.get('/places/:id', placeController.getPlaceById);

module.exports = router;
