const express = require('express');
const router = express.Router();
const { uploadExamImages } = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/', requireAuth(), uploadExamImages, require('../controller/createPost').createPost);
router.get('/search', require('../controller/searchPost').searchPost);
router.get('/get-posts', require('../controller/getPost').getPosts);
router.get('/get-posts/:post_id', require('../controller/detailPost').detailPost);

module.exports = router;
