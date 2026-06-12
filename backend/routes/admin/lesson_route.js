const express = require('express');
const router = express.Router();
const adminLessonController = require('../../controller/admin/adminLessonController');
const { requireAuth } = require('../../middleware/auth.middleware'); 
const { uploadLessonFiles } = require('../../middleware/upload'); 

// Cấu hình danh sách trường nhận diện linh hoạt cho cả thumbnail và video
const lessonUploadFields = uploadLessonFiles.fields([
  { name: 'thumbnailFile', maxCount: 1 }, 
  { name: 'thumbnail', maxCount: 1 }, 
  { name: 'videoFile', maxCount: 1 }, 
  { name: 'video', maxCount: 1 }
]);

router.get('/:id', requireAuth(['admin', 'teacher']), adminLessonController.getLessonDetail);
router.post('/create', requireAuth(['admin', 'teacher']), lessonUploadFields, adminLessonController.createLesson);
router.put('/:id', requireAuth(['admin', 'teacher']), lessonUploadFields, adminLessonController.updateLesson);

router.delete('/:id', requireAuth(['admin', 'teacher']), adminLessonController.deleteLesson);

module.exports = router;