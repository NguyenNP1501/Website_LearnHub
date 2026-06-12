const ABSOLUTE_URL_PATTERN = /^(?:https?:)?\/\//i;
const INLINE_URL_PATTERN = /^(?:data|blob):/i;

const getServerOrigin = (req) =>
  String(
    process.env.PUBLIC_SERVER_URL || `${req.protocol}://${req.get("host")}`,
  ).replace(/\/+$/, "");

const toPublicAssetUrl = (req, assetPath) => {
  const normalizedPath = String(assetPath ?? "").trim();

  if (!normalizedPath) {
    return "";
  }

  if (
    ABSOLUTE_URL_PATTERN.test(normalizedPath) ||
    INLINE_URL_PATTERN.test(normalizedPath)
  ) {
    return normalizedPath;
  }

  if (normalizedPath.startsWith("/")) {
    return `${getServerOrigin(req)}${normalizedPath}`;
  }

  return `${getServerOrigin(req)}/${normalizedPath.replace(/^\/+/, "")}`;
};

const hydrateExamImageUrls = (req, exam) => {
  if (!exam || !Array.isArray(exam.questions)) {
    return exam;
  }

  return {
    ...exam,
    questions: exam.questions.map((question) => ({
      ...question,
      imgUrl: toPublicAssetUrl(req, question.imgUrl),
    })),
  };
};

const hydrateAttemptImageUrls = (req, attempt) => {
  if (!attempt || !Array.isArray(attempt.questions)) {
    return attempt;
  }

  return {
    ...attempt,
    questions: attempt.questions.map((question) => ({
      ...question,
      imgUrl: toPublicAssetUrl(req, question.imgUrl),
    })),
  };
};

module.exports = {
  hydrateAttemptImageUrls,
  hydrateExamImageUrls,
  toPublicAssetUrl,
};
