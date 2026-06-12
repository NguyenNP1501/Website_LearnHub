const express = require('express');
const router = express.Router();
const clientLessonController = require('../../controller/client/clientLessonController');
const { requireAuth } = require('../../middleware/auth.middleware'); 

router.use(requireAuth(['admin', 'teacher', 'student']));

router.get('/:id', clientLessonController.getLessonDetail);
router.post('/:id/progress', clientLessonController.saveVideoProgress);

module.exports = router;