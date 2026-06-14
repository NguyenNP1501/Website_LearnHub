const express = require("express");
const latestCourseController = require("../controller/latest_course.controller");

const router = express.Router();

router.get('/', latestCourseController.getLatestCourse);

module.exports = router;
