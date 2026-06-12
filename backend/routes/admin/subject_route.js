const express = require('express');
const router = express.Router();
const adminSubjectController = require('../../controller/admin/adminSubjectController');
const { requireAuth } = require('../../middleware/auth.middleware'); 

router.use(requireAuth(['admin', 'teacher']));

router.get('/', adminSubjectController.getAllSubjects);
router.post('/', adminSubjectController.addSubject);
router.put('/:id', adminSubjectController.updateSubject);

module.exports = router;