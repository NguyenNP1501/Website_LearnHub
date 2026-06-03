const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

router.post('/', upload.array('files', 10), require('../controller/createPost').createPost);
router.get('/search', require('../controller/searchPost').searchPost);
router.get('/get-posts', require('../controller/getPosts').getPosts);
router.get('/get-posts/:post_id', require('../controller/detailPost').detailPost);

module.exports = router;