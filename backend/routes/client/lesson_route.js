const express = require('express');
const router = express.Router();
const clientLessonController = require('../../controller/client/clientLessonController');
const lessonPracticeExamModel = require('../../models/ThiVaCauHoi/lsssonPracticeExam.model');
const { requireAuth } = require('../../middleware/auth.middleware'); 

router.use(requireAuth(['admin', 'teacher', 'student']));

router.get('/:id', clientLessonController.getLessonDetail);
router.post('/:id/progress', clientLessonController.saveVideoProgress);

router.get('/:id/exams', async (req, res, next) => {
  try {
    const exams = await lessonPracticeExamModel.getExamsByLesson(req.params.id);
    res.json(exams);
  } catch (error) {
    next(error);
  }
});

module.exports = router;