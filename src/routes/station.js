const express = require('express');
const router = express.Router();
const stationController = require('../app/controllers/station');
const authenticateJWT = require('../app/middlewares/auth');

//Endpoints
router.post('/create-station/', authenticateJWT, stationController.createStation);
router.get('/', stationController.listStation);
router.post('/find-station/', stationController.findAllPaths);
router.post('/my-journey/', stationController.myJourney);
module.exports = router;
