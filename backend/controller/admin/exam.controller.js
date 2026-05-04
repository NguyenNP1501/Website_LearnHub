const practiceExamModel = require("../../models/ThiVaCauHoi/practiceExam.model");

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

    return res.json(exam);
  } catch (error) {
    return next(error);
  }
};

exports.createExam = async (req, res, next) => {
  try {
    const result = await practiceExamModel.createExam(req.body);
    const exam = await practiceExamModel.getAdminExamDetail(result.examId);

    return res.status(201).json(exam);
  } catch (error) {
    return next(error);
  }
};

exports.updateExam = async (req, res, next) => {
  try {
    await practiceExamModel.updateExam(req.params.examId, req.body);
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
