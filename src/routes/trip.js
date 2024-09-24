const express = require('express');
const router = express.Router();
const tripController = require('../app/controllers/trip');
const authenticateJWT = require('../app/middlewares/auth');

router.post('/create-trip/', authenticateJWT, tripController.createTrip);
router.get('/', tripController.listTrip);
router.post('/book-seat/:tripId/', authenticateJWT, tripController.bookSeats);
router.get('/:id', tripController.detailTrip);
module.exports = router;
