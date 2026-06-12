const express = require("express");
const examController = require("../../controller/client/exam.controller");
const { requireAuth } = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(requireAuth("student"));

router.get("/", examController.getPublishedExams);
router.get("/:examId", examController.getExamDetail);
router.post("/:examId/submit", examController.submitExam);

module.exports = router;
