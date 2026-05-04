const practiceExamModel = require("../../models/ThiVaCauHoi/practiceExam.model");
const attemptModel = require("../../models/LamBai/attempt.model");
const {
  evaluateExamSubmission,
  mapAttemptToClientShape,
} = require("../../utils/examResult.util");

exports.getPublishedExams = async (req, res, next) => {
  try {
    const exams = await practiceExamModel.getPublishedForClient({
      keyword: req.query.keyword ?? "",
    });

    res.json({
      success: true,
      data: exams,
    });
  } catch (error) {
    next(error);
  }
};

exports.getExamDetail = async (req, res, next) => {
  try {
    const exam = await practiceExamModel.getPublishedExamDetailForClient(
      req.params.examId,
      { includeCorrectAnswers: false },
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    return res.json({
      success: true,
      data: exam,
    });
  } catch (error) {
    return next(error);
  }
};

exports.submitExam = async (req, res, next) => {
  try {
    const exam = await practiceExamModel.getPublishedExamDetailForClient(
      req.params.examId,
      { includeCorrectAnswers: true },
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const answerMap =
      req.body && typeof req.body.answers === "object" ? req.body.answers : {};
    const evaluation = evaluateExamSubmission({
      exam,
      answerMap,
    });

    const attemptRecord = await attemptModel.createAttempt({
      studentId: Number(req.auth.profileId),
      practiceExamId: Number(req.params.examId),
      score: evaluation.score,
      timeSpentSeconds: Number(req.body?.timeSpentSeconds ?? 0),
      questionResults: evaluation.questions,
    });

    const payload = mapAttemptToClientShape({
      attempt: attemptRecord,
      exam,
      evaluation,
    });

    return res.status(201).json({
      success: true,
      data: payload,
    });
  } catch (error) {
    return next(error);
  }
};
