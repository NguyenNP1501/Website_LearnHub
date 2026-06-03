const express = require("express");
const examController = require("../../controller/admin/exam.controller");
const {
  requireAuth
} = require("../../middleware/auth.middleware");
const {
  uploadExamImages,
  uploadImportExamFile,
  parseMultipartExamPayload,
} = require("../../middleware/upload");

const router = express.Router();

router.use(requireAuth("admin"));

router.get("/", examController.getAllExams);
router.post("/import", uploadImportExamFile, examController.importExam);
router.get("/:examId", examController.getExamById);
router.post(
  "/",
  uploadExamImages,
  parseMultipartExamPayload,
  examController.createExam,
);
router.put(
  "/:examId",
  uploadExamImages,
  parseMultipartExamPayload,
  examController.updateExam,
);
router.patch("/:examId", examController.updateExamStatus);
router.delete("/:examId", examController.deleteExam);

module.exports = router;