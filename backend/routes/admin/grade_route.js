const express = require('express');
const router = express.Router();

const adminGradeController = require('../../controller/admin/adminGradeController');
const { requireAuth } = require('../../middleware/auth.middleware');

router.use(requireAuth(['admin', 'teacher']));

router.get('/', adminGradeController.getAllGrades);
router.post('/', adminGradeController.addGrade);
router.put('/:gradeId', adminGradeController.updateGrade);

module.exports = router;