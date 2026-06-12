const express = require('express');
const router = express.Router();
const profileController = require('../controller/profileController');
const { requireAuth } = require('../middleware/auth.middleware'); 

// Định nghĩa API lấy dữ liệu trang cá nhân học sinh
router.get('/', requireAuth(), profileController.getProfileDetails);

router.put('/update', requireAuth(), profileController.updateProfile);
router.put('/change-password', requireAuth(), profileController.changePassword);

module.exports = router;