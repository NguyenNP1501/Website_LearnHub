const attemptModel = require("../../models/LamBai/attempt.model");
const practiceExamModel = require("../../models/ThiVaCauHoi/practiceExam.model");
const {
  evaluateExamSubmission,
  mapAttemptToClientShape,
} = require("../../utils/examResult.util");

exports.getAttemptHistory = async (req, res, next) => {
  try {
    const attempts = await attemptModel.searchHistory({
      studentId: Number(req.auth.profileId),
      keyword: req.query.keyword ?? "",
    });

    res.json({
      success: true,
      data: attempts,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAttemptDetail = async (req, res, next) => {
  try {
    const studentId = Number(req.auth.profileId);
    const attempt = await attemptModel.getAttemptBaseById(
      req.params.attemptId,
      studentId,
    );

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    const exam = await practiceExamModel.getAssignment(attempt.practiceExamId, {
      includeCorrectAnswers: true,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const answerRows = await attemptModel.getAnswersByAttemptId(req.params.attemptId);
    const answerMap = answerRows.reduce((accumulator, row) => {
      accumulator[String(row.questionId)] = row.answerId
        ? String(row.answerId)
        : row.answerText ?? "";
      return accumulator;
    }, {});

    const evaluation = evaluateExamSubmission({
      exam,
      answerMap,
    });

    const payload = mapAttemptToClientShape({
      attempt,
      exam,
      evaluation,
    });

    return res.json({
      success: true,
      data: payload,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteAttempt = async (req, res, next) => {
  try {
    await attemptModel.deleteAttempt(
      req.params.attemptId,
      Number(req.auth.profileId),
    );

    return res.json({
      success: true,
      message: "Attempt deleted successfully",
    });
  } catch (error) {
    if (error.message === "Attempt not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
};
