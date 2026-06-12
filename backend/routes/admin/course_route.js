const express = require('express');
const router = express.Router();
const adminCourseController = require('../../controller/admin/adminCourseController'); 
const { requireAuth } = require("../../middleware/auth.middleware");

const { uploadLessonFiles } = require('../../middleware/upload'); 

router.use(requireAuth(["admin", "teacher"]));
router.post('/create', uploadLessonFiles.single('thumbnailFile'), adminCourseController.createCourse);
router.put('/update/:id', uploadLessonFiles.single('thumbnailFile'), adminCourseController.updateCourse);

router.delete('/:id', adminCourseController.deleteCourse);

// 3. Xuất router ra để dùng
module.exports = router;