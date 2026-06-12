const express = require('express');
const router = express.Router();
const clientLessonController = require('../../controller/client/clientLessonController');


const { requireAuth } = require('../../middleware/auth.middleware'); 

router.get('/:id', requireAuth(), clientLessonController.getLessonDetail);
router.post('/:id/progress', requireAuth(), clientLessonController.saveVideoProgress);

module.exports = router;