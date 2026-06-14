const express = require('express');
const router = express.Router();
const { uploadExamImages } = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/', requireAuth(), uploadExamImages, require('../controller/createComment').createComment);
router.get('/get-comments/:post_id', require('../controller/getComment').getComments);

module.exports = router;