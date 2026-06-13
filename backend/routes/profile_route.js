const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const profileController = require('../controller/profileController');
const { requireAuth } = require('../middleware/auth.middleware');

// Multer riêng cho avatar
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'uploads', 'Avatar');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    }
});

const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: (req, file, cb) => {
        const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
        allowed.has(file.mimetype) ? cb(null, true) : cb(new Error('Chỉ hỗ trợ JPG, PNG, WEBP!'));
    },
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
}).single('avatar');

router.get('/', requireAuth(), profileController.getProfileDetails);
router.put('/update', requireAuth(), profileController.updateProfile);
router.put('/change-password', requireAuth(), profileController.changePassword);

// Thêm route upload avatar
router.put('/avatar', requireAuth(), uploadAvatar, profileController.updateAvatar);

module.exports = router;