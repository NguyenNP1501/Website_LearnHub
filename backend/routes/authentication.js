const express = require('express');
const router = express.Router();
const authenticationController = require('../controller/authentication.controller');

router.post('/handle-token', authenticationController.handleToken);
router.get('/reset-password', authenticationController.verifyToken);
router.post('/reset-password', authenticationController.changePassword);

module.exports = router;
