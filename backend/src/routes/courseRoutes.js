const express = require("express");
const router = express.Router();
const { getCourses, getCourseDetail } = require("../controllers/courseControllers");

router.get("/", getCourses);
router.get("/:id", getCourseDetail);

module.exports = router;