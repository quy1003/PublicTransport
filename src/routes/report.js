const express = require('express');
const router = express.Router();
const reportController = require('../app/controllers/report');

router.post('/create-report/', reportController.createReport);
router.get('/', reportController.listReport);
router.patch('/:id/update-report/', reportController.updateReport)
module.exports = router;
