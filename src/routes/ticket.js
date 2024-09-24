const express = require('express');
const router = express.Router();
const ticketController = require('../app/controllers/ticket');
const authenticateJWT = require('../app/middlewares/auth');

router.get('/', authenticateJWT, ticketController.listTicket);

module.exports = router;
