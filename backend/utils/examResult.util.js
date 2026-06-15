const normalizeText = (value) => String(value ?? "").trim();
const normalizeCompareText = (value) =>
  normalizeText(value).replace(/\s+/g, " ").toLowerCase();

const uniqueValues = (values) => Array.from(new Set(values));

const isMultipleChoiceQuestion = (question) => {
  const type = normalizeCompareText(question?.type);
  return ["2", "multiple", "multiple_choice", "mutiple"].includes(type);
};

const isObjectiveQuestion = (question) => {
  const type = normalizeCompareText(question?.type);
  return !["3", "fill", "fill_blank", "text", "input"].includes(type);
};

const evaluateExamSubmission = ({ exam, answerMap }) => {
  const safeAnswerMap = answerMap ?? {};

  const questions = exam.questions.map((question, index) => {
    const submittedValue = safeAnswerMap[String(question.id)] ?? "";
    const submittedValues = Array.isArray(submittedValue)
      ? uniqueValues(submittedValue.map(normalizeText).filter(Boolean))
      : normalizeText(submittedValue)
        ? [normalizeText(submittedValue)]
        : [];
    const rawSubmittedValue = Array.isArray(submittedValue)
      ? submittedValues
      : normalizeText(submittedValue);
    const objectiveQuestion = isObjectiveQuestion(question);
    const multipleChoiceQuestion = isMultipleChoiceQuestion(question);
    const correctAnswers = question.answers.filter((answer) => answer.isCorrect);

    let matchedAnswer = null;
    let matchedAnswers = [];
    let isCorrect = false;
    let studentAnswerLabel = "";

    if (objectiveQuestion) {
      if (multipleChoiceQuestion) {
        const correctAnswerIds = correctAnswers.map((answer) => String(answer.id));
        matchedAnswers = question.answers.filter((answer) =>
          submittedValues.includes(String(answer.id)),
        );
        isCorrect =
          submittedValues.length === correctAnswerIds.length &&
          submittedValues.every((answerId) => correctAnswerIds.includes(answerId));
        studentAnswerLabel = matchedAnswers.map((answer) => answer.content).join(", ");
      } else {
        matchedAnswer =
          question.answers.find(
            (answer) => String(answer.id) === String(submittedValues[0] ?? ""),
          ) ?? null;
        matchedAnswers = matchedAnswer ? [matchedAnswer] : [];
        isCorrect = Boolean(matchedAnswer?.isCorrect);
        studentAnswerLabel = matchedAnswer?.content ?? "";
      }
    } else {
      matchedAnswer =
        question.answers.find(
          (answer) =>
            normalizeCompareText(answer.content) ===
            normalizeCompareText(submittedValues[0] ?? ""),
        ) ?? null;
      matchedAnswers = matchedAnswer ? [matchedAnswer] : [];
      isCorrect = Boolean(matchedAnswer?.isCorrect);
      studentAnswerLabel = submittedValues[0] ?? "";
    }

    const selectedAnswerIds = objectiveQuestion
      ? matchedAnswers.map((answer) => answer.id)
      : [];

    return {
      id: question.id,
      index: index + 1,
      content: question.content,
      type: question.type,
      imgUrl: question.imgUrl,
      isObjective: objectiveQuestion,
      isMultipleChoice: multipleChoiceQuestion,
      submittedValue: rawSubmittedValue,
      selectedAnswerId: selectedAnswerIds[0] ?? null,
      selectedAnswerIds,
      studentAnswerLabel,
      correctAnswer: correctAnswers.map((answer) => answer.content).join(", "),
      isCorrect,
      isAnswered: submittedValues.length > 0,
    };
  });

  const totalQuestions = questions.length;
  const correctCount = questions.filter((question) => question.isCorrect).length;
  const answeredCount = questions.filter((question) => question.isAnswered).length;
  const unansweredCount = totalQuestions - answeredCount;
  const incorrectCount = totalQuestions - correctCount;
  const scorePercent = totalQuestions
    ? Number(((correctCount / totalQuestions) * 100).toFixed(2))
    : 0;
  const score = totalQuestions
    ? Number(((correctCount / totalQuestions) * 10).toFixed(2))
    : 0;

  return {
    totalQuestions,
    correctCount,
    answeredCount,
    unansweredCount,
    incorrectCount,
    scorePercent,
    score,
    questions,
  };
};

const mapAttemptToClientShape = ({ attempt, exam, evaluation }) => ({
  id: String(attempt.attemptId),
  examId: String(exam.id),
  examTitle: exam.title,
  subject: exam.subject,
  lesson: exam.lesson,
  grade: exam.grade,
  timeMinutes: exam.timeMinutes,
  timeSpentSeconds: Number(attempt.timeSpentSeconds ?? 0),
  submittedAt: attempt.submittedAt,
  totalQuestions: evaluation.totalQuestions,
  correctCount: evaluation.correctCount,
  incorrectCount: evaluation.incorrectCount,
  unansweredCount: evaluation.unansweredCount,
  score: evaluation.score,
  scorePercent: evaluation.scorePercent,
  questions: evaluation.questions.map((question) => ({
    id: String(question.id),
    index: question.index,
    content: question.content,
    type: question.type,
    imgUrl: question.imgUrl,
    studentAnswer: question.submittedValue,
    studentAnswerLabel: question.studentAnswerLabel,
    correctAnswer: question.correctAnswer,
    isCorrect: question.isCorrect,
    isAnswered: question.isAnswered,
  })),
});

module.exports = {
  evaluateExamSubmission,
  isMultipleChoiceQuestion,
  mapAttemptToClientShape,
};
