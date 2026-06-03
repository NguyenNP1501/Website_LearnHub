const express = require('express');
const router = express.Router();

router.post('/handle-token', require('../controller/handleToken').handleToken);
router.get('/reset-password', require('../controller/authController').verifyToken);
router.post('/reset-password', require('../controller/authController').changePassword);

module.exports = router;