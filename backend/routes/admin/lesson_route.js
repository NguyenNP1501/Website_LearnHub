const express = require('express');
const router = express.Router();
const adminLessonController = require('../../controller/admin/adminLessonController');
const { requireAuth } = require('../../middleware/auth.middleware'); 
const { uploadLessonFiles } = require('../../middleware/upload'); 

router.use(requireAuth(['admin', 'teacher']));

// 2. CẤU HÌNH CÁC TRƯỜNG UPLOAD FILE
const lessonUploadFields = uploadLessonFiles.fields([
  { name: 'thumbnailFile', maxCount: 1 }, 
  { name: 'thumbnail', maxCount: 1 }, 
  { name: 'videoFile', maxCount: 1 }, 
  { name: 'video', maxCount: 1 }
]);

router.get('/:id', adminLessonController.getLessonDetail);

router.post('/create', lessonUploadFields, adminLessonController.createLesson);

router.put('/:id', lessonUploadFields, adminLessonController.updateLesson);

router.delete('/:id', adminLessonController.deleteLesson);

module.exports = router;