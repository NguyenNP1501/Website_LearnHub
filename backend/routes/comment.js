const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

router.post('/', upload.array('files', 10), require('../controller/createComment').createComment);
router.get('/get-comments/:post_id', require('../controller/getComments').getComments);

module.exports = router;
