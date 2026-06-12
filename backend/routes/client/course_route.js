const express = require('express');
const router = express.Router();

const clientCourseController = require('../../controller/client/clientCourseController');



router.get('/', clientCourseController.getAllCourses);

router.get('/:id', clientCourseController.getCourseDetail);

router.get('/:id/enroll-status', clientCourseController.checkStatus);
router.post('/:id/enroll', clientCourseController.enroll);

module.exports = router;