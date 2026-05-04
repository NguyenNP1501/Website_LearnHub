const express = require("express");
const examController = require("../../controller/admin/exam.controller");
const { requireAuth } = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(requireAuth("admin"));

router.get("/", examController.getAllExams);
router.get("/:examId", examController.getExamById);
router.post("/", examController.createExam);
router.put("/:examId", examController.updateExam);
router.patch("/:examId", examController.updateExamStatus);
router.delete("/:examId", examController.deleteExam);

module.exports = router;
