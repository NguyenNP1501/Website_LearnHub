const practiceExamModel = require("../../models/ThiVaCauHoi/practiceExam.model");
const { parseExamImportFile } = require("../../utils/examImport.util");
const { hydrateExamImageUrls } = require("../../utils/assetUrl.util");
const lessonPracticeExamModel = require("../../models/ThiVaCauHoi/lsssonPracticeExam.model");

exports.getAllExams = async (req, res, next) => {
  try {
    const exams = await practiceExamModel.getAdminExamList();
    res.json(exams);
  } catch (error) {
    next(error);
  }
};

exports.getExamById = async (req, res, next) => {
  try {
    const exam = await practiceExamModel.getAdminExamDetail(req.params.examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    return res.json(hydrateExamImageUrls(req, exam));
  } catch (error) {
    return next(error);
  }
};

exports.createExam = async (req, res, next) => {
  try {
    const examData = req.body.payload
      ? JSON.parse(req.body.payload)
      : req.body;

    const lessonId = examData.lesson_id ?? examData.lessonId ?? null;

    // Tạo exam KHÔNG kèm lesson_id trong PracticeExam
    const examDataWithoutLesson = { ...examData, lesson_id: null, lessonId: null };
    const result = await practiceExamModel.createExam(examDataWithoutLesson);
    const exam = await practiceExamModel.getAdminExamDetail(result.examId);

    // Gán vào lesson_practiceexam nếu có lessonId hợp lệ
    if (lessonId) {
      await lessonPracticeExamModel.add(lessonId, result.examId);
    }

    return res.status(201).json(hydrateExamImageUrls(req, exam));
  } catch (error) {
    return next(error);
  }
};

exports.importExam = async (req, res, next) => {
  try {
    const examPayload = parseExamImportFile({
      fileBuffer: req.file?.buffer,
      originalName: req.file?.originalname,
      importMode: String(req.body?.importMode || "exported").trim().toLowerCase(),
    });

    const result = await practiceExamModel.createExam(examPayload);
    const exam = await practiceExamModel.getAdminExamDetail(result.examId);

    return res.status(201).json(hydrateExamImageUrls(req, exam));
  } catch (error) {
    return next(error);
  }
};

exports.updateExam = async (req, res, next) => {
  try {
    await practiceExamModel.updateExam(req.params.examId, req.body);
    const exam = await practiceExamModel.getAdminExamDetail(req.params.examId);

    return res.json(hydrateExamImageUrls(req, exam));
  } catch (error) {
    if (error.message === "Exam not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
};

exports.updateExamStatus = async (req, res, next) => {
  try {
    await practiceExamModel.updateExamStatus(req.params.examId, req.body);
    const exam = await practiceExamModel.getAdminExamDetail(req.params.examId);

    return res.json(exam);
  } catch (error) {
    if (error.message === "Exam not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
};

exports.deleteExam = async (req, res, next) => {
  try {
    await practiceExamModel.deleteExam(req.params.examId);
    return res.json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    if (error.message === "Exam not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
};
