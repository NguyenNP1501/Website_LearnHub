const express = require('express');
const router = express.Router();

const clientCourseController = require('../../controller/client/clientCourseController');
const { requireAuth } = require('../../middleware/auth.middleware');

// ==========================================
// CÁC ROUTE CÔNG KHAI (PUBLIC)
// ==========================================
router.get('/', clientCourseController.getAllCourses);
router.get('/:id', clientCourseController.getCourseDetail);

// ==========================================
// TRẠM KIỂM SOÁT QUYỀN HỌC SINH (STUDENT)
// Kể từ dòng này trở xuống bắt buộc phải có token quyền "student"
// ==========================================
router.use(requireAuth("student"));

// ==========================================
// CÁC ROUTE BẢO MẬT (PRIVATE)
// ==========================================
router.get('/:id/enroll-status', clientCourseController.checkStatus);
router.post('/:id/enroll', clientCourseController.enroll);

module.exports = router;