const XLSX = require("xlsx");

const HEADER_ALIASES = {
  title: ["title", "examtitle", "exam_title", "tende", "ten_de"],
  subject: ["subject", "monhoc", "mon_hoc"],
  lesson: ["lesson", "tenbai", "ten_bai"],
  lessonId: ["lessonid", "lesson_id", "mabai", "ma_bai"],
  grade: ["grade", "khoi", "lop", "gradeclass", "grade_class"],
  time: ["time", "timeminutes", "time_minutes", "thoigian", "thoi_gian"],
  questionNo: ["questionno", "question_no", "stt", "cau", "cauhoi", "cau_hoi"],
  questionType: ["questiontype", "question_type", "type", "loaicau", "loai_cau"],
  questionContent: [
    "questioncontent",
    "question_content",
    "question",
    "questiontext",
    "question_text",
    "noidungcauhoi",
    "noi_dung_cau_hoi",
  ],
  questionImageUrl: [
    "questionimageurl",
    "question_image_url",
    "imgurl",
    "imageurl",
    "image",
    "anh",
  ],
  answerContent: [
    "answercontent",
    "answer_content",
    "answer",
    "option",
    "optioncontent",
    "option_content",
    "dap_an",
    "dapan",
  ],
  isCorrect: ["iscorrect", "is_correct", "correct", "dung", "dapan_dung"],
};

const normalizeHeader = (header) =>
  String(header ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  return ["1", "true", "yes", "y", "x", "dung"].includes(
    String(value ?? "").trim().toLowerCase(),
  );
};

const normalizeQuestionType = (value) => {
  const rawValue = String(value ?? "").trim().toLowerCase();

  if (["1", "single", "single_choice", "mot", "1dapan"].includes(rawValue)) {
    return 1;
  }

  if (["2", "multiple", "multiple_choice", "nhieu", "nhieudapan"].includes(rawValue)) {
    return 2;
  }

  // if (["3", "fill", "fill_blank", "text", "input", "dien"].includes(rawValue)) {
  //   return 3;
  // }
  return Number(rawValue) === 2 ? 2 : 1;
  //return Number(rawValue) === 2 ? 2 : Number(rawValue) === 3 ? 3 : 1;
};

const extractCell = (row, fieldName) => {
  for (const alias of HEADER_ALIASES[fieldName]) {
    if (Object.prototype.hasOwnProperty.call(row, alias)) {
      return row[alias];
    }
  }

  return "";
};

const getFirstNonEmptyValue = (rows, fieldName) => {
  for (const row of rows) {
    const value = String(extractCell(row, fieldName) ?? "").trim();
    if (value) {
      return value;
    }
  }

  return "";
};

const createImportError = (message) => {
  const error = new Error(message);
  error.status = 400;
  return error;
};

const getQuestionSortValue = (questionNo) => {
  const numericValue = Number(questionNo);
  return Number.isNaN(numericValue) ? Number.MAX_SAFE_INTEGER : numericValue;
};

const normalizeRowShape = (row = {}) => {
  const normalizedRow = {};

  for (const [key, value] of Object.entries(row)) {
    normalizedRow[normalizeHeader(key)] = value;
  }

  return normalizedRow;
};

const validateQuestion = (question, questionNo) => {
  if (!question.content) {
    throw createImportError(`Question ${questionNo} is missing content.`);
  }

  if (question.type === 1) {
    if (question.answer.length < 2) {
      throw createImportError(
        `Question ${questionNo} must have at least 2 answers for single choice.`,
      );
    }

    const correctCount = question.answer.filter((answer) => answer.isCorrect).length;
    if (correctCount !== 1) {
      throw createImportError(
        `Question ${questionNo} must have exactly 1 correct answer.`,
      );
    }
  }

  if (question.type === 2) {
    if (question.answer.length < 2) {
      throw createImportError(
        `Question ${questionNo} must have at least 2 answers for multiple choice.`,
      );
    }

    const correctCount = question.answer.filter((answer) => answer.isCorrect).length;
    if (correctCount < 1) {
      throw createImportError(
        `Question ${questionNo} must have at least 1 correct answer.`,
      );
    }
  }

  if (question.type === 3) {
    if (!question.answer[0]?.content) {
      throw createImportError(`Question ${questionNo} must have a fill answer.`);
    }

    question.answer = [
      {
        content: question.answer[0].content,
        isCorrect: true,
      },
    ];
  }
};

const parseExamImportFile = ({ fileBuffer, originalName, importMode }) => {
  if (!fileBuffer) {
    throw createImportError("Import file is required.");
  }

  const workbook = XLSX.read(fileBuffer, {
    type: "buffer",
    raw: false,
  });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw createImportError("Import file does not contain any sheet.");
  }

  const rows = XLSX.utils
    .sheet_to_json(workbook.Sheets[firstSheetName], {
      defval: "",
      raw: false,
    })
    .map(normalizeRowShape)
    .filter((row) =>
      Object.values(row).some((value) => String(value ?? "").trim() !== ""),
    );

  if (!rows.length) {
    throw createImportError(`Import file "${originalName}" is empty.`);
  }

  const title = getFirstNonEmptyValue(rows, "title");
  const subject = getFirstNonEmptyValue(rows, "subject");
  const lesson = getFirstNonEmptyValue(rows, "lesson");
  const lessonId = getFirstNonEmptyValue(rows, "lessonId");
  const grade = getFirstNonEmptyValue(rows, "grade");
  const time = getFirstNonEmptyValue(rows, "time");

  if (!title || !subject || !grade || !time) {
    throw createImportError(
      "The file must include exam title, subject, grade, and time columns.",
    );
  }

  const questionsMap = new Map();

  for (const row of rows) {
    const questionNo = String(extractCell(row, "questionNo") ?? "").trim();
    const questionContent = String(extractCell(row, "questionContent") ?? "").trim();
    const questionType = normalizeQuestionType(extractCell(row, "questionType"));
    const questionImageUrl = String(
      extractCell(row, "questionImageUrl") ?? "",
    ).trim();
    const answerContent = String(extractCell(row, "answerContent") ?? "").trim();
    const isCorrect = normalizeBoolean(extractCell(row, "isCorrect"));

    if (!questionNo) {
      throw createImportError(
        'Each row must include a "question_no" column to group answers.',
      );
    }

    if (!questionsMap.has(questionNo)) {
      questionsMap.set(questionNo, {
        content: questionContent,
        type: questionType,
        imgUrl: questionImageUrl,
        answer: [],
      });
    }

    const question = questionsMap.get(questionNo);

    if (!question.content && questionContent) {
      question.content = questionContent;
    }

    if (!question.imgUrl && questionImageUrl) {
      question.imgUrl = questionImageUrl;
    }

    question.type = questionType;

    if (questionType === 3) {
      if (answerContent) {
        question.answer.push({
          content: answerContent,
          isCorrect: true,
        });
      }
      continue;
    }

    if (!answerContent) {
      throw createImportError(`Question ${questionNo} has an empty answer row.`);
    }

    question.answer.push({
      content: answerContent,
      isCorrect,
    });
  }

  const questions = Array.from(questionsMap.entries())
    .sort((left, right) => {
      const leftValue = getQuestionSortValue(left[0]);
      const rightValue = getQuestionSortValue(right[0]);

      if (leftValue === rightValue) {
        return String(left[0]).localeCompare(String(right[0]));
      }

      return leftValue - rightValue;
    })
    .map(([questionNo, question]) => {
      validateQuestion(question, questionNo);
      return question;
    });

  if (!questions.length) {
    throw createImportError("No valid questions were found in the import file.");
  }

  return {
    title,
    subject,
    lesson,
    lessonId,
    time,
    grade,
    exported: importMode !== "saved",
    saved: importMode === "saved",
    deleted: false,
    questions,
  };
};

module.exports = {
  parseExamImportFile,
};
