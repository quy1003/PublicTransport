const express = require('express');
const router = express.Router();
const busController = require('../app/controllers/bus');

router.post('/create-bus/', busController.createBus);
router.post('/add-seats/:id', busController.addSeat);
router.get('/list-seats/:id', busController.listSeat);
router.get('/', busController.listBus)
module.exports = router;
