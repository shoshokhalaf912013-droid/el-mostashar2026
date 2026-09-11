// routes/attemptRoutes.js
const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attemptController');

router.post('/start', attemptController.startAttempt);
router.get('/:id', attemptController.getAttempt);
router.post('/:id/save', attemptController.saveAttempt);
router.post('/:id/ping', attemptController.pingAttempt);
router.post('/:id/leave', attemptController.leaveAttempt);
router.post('/:id/submit', attemptController.submitAttempt);

module.exports = router;
