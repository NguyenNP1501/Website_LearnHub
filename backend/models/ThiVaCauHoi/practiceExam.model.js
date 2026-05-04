const db = require("../../configs/database.config");

const normalizeBoolean = (value, fallback = false) => {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  return ["true", "1", "yes"].includes(String(value).trim().toLowerCase());
};

const normalizeQuestionType = (value) => String(value ?? "1");

const normalizeAnswerInput = (answer = {}) => ({
  content: answer.content ?? answer.answer_text ?? "",
  isCorrect: normalizeBoolean(answer.isCorrect ?? answer.is_correct, false),
});

const normalizeQuestionInput = (question = {}) => ({
  content: question.content ?? question.question_text ?? "",
  type: normalizeQuestionType(question.type),
  imgUrl: question.imgUrl ?? question.imgurl ?? "",
  answer: Array.isArray(question.answer)
    ? question.answer.map(normalizeAnswerInput)
    : Array.isArray(question.answers)
      ? question.answers.map(normalizeAnswerInput)
      : [],
});

const normalizeNullableNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? null : parsedValue;
};

const normalizeExamPayload = (examData = {}) => ({
  title: examData.title ?? "",
  subject: examData.subject ?? "",
  lessonId: normalizeNullableNumber(examData.lessonId ?? examData.lesson_id),
  time: Number(examData.time ?? examData.timeMinutes ?? 0),
  grade: String(examData.grade ?? examData.grade_class ?? ""),
  exported: normalizeBoolean(
    examData.exported ?? examData.isExported ?? examData.is_exported,
    false,
  ),
  saved: normalizeBoolean(
    examData.saved ?? examData.isSaved ?? examData.is_saved,
    false,
  ),
  deleted: normalizeBoolean(
    examData.deleted ?? examData.isDeleted ?? examData.is_deleted,
    false,
  ),
  questions: Array.isArray(examData.questions)
    ? examData.questions.map(normalizeQuestionInput)
    : [],
});

const deleteExamDependencies = async (connection, practiceExamId) => {
  const [questionRows] = await connection.query(
    `
      SELECT question_id
      FROM Question
      WHERE practice_exam_id = ?
    `,
    [practiceExamId],
  );

  const questionIds = questionRows
    .map((row) => Number(row.question_id))
    .filter(Boolean);

  if (questionIds.length > 0) {
    const [answerRows] = await connection.query(
      `
        SELECT answer_id
        FROM Answer
        WHERE question_id IN (?)
      `,
      [questionIds],
    );

    const answerIds = answerRows
      .map((row) => Number(row.answer_id))
      .filter(Boolean);

    const [studentAnswerRows] = await connection.query(
      `
        SELECT student_answer_id
        FROM student_answer
        WHERE question_id IN (?)
          OR answer_id IN (?)
      `,
      [questionIds, answerIds.length > 0 ? answerIds : [0]],
    );

    const studentAnswerIds = studentAnswerRows
      .map((row) => Number(row.student_answer_id))
      .filter(Boolean);

    if (studentAnswerIds.length > 0) {
      await connection.query(
        `
          DELETE FROM student_answer_attempt
          WHERE student_answer_id IN (?)
        `,
        [studentAnswerIds],
      );

      await connection.query(
        `
          DELETE FROM student_answer
          WHERE student_answer_id IN (?)
        `,
        [studentAnswerIds],
      );
    }
  }

  await connection.query(
    `
      DELETE FROM Attempt
      WHERE practice_exam_id = ?
    `,
    [practiceExamId],
  );

  await connection.query(
    `
      DELETE FROM ExamQuestion
      WHERE practice_exam_id = ?
    `,
    [practiceExamId],
  );

  await connection.query(
    `
      DELETE FROM Question
      WHERE practice_exam_id = ?
    `,
    [practiceExamId],
  );
};

const mapExamRows = (rows, { includeCorrectAnswers = false } = {}) => {
  if (!rows.length) {
    return null;
  }

  const firstRow = rows[0];
  const questionsMap = new Map();

  for (const row of rows) {
    if (!row.question_id) {
      continue;
    }

    if (!questionsMap.has(row.question_id)) {
      questionsMap.set(row.question_id, {
        id: String(row.question_id),
        content: row.question_text,
        type: String(row.type ?? ""),
        imgUrl: row.imgurl || "",
        order: row.number_of_question,
        answers: [],
      });
    }

    if (row.answer_id) {
      questionsMap.get(row.question_id).answers.push({
        id: String(row.answer_id),
        content: row.answer_text,
        ...(includeCorrectAnswers ? { isCorrect: Boolean(row.is_correct) } : {}),
      });
    }
  }

  return {
    id: String(firstRow.practice_exam_id),
    title: firstRow.title,
    subject: firstRow.subject,
    lesson: firstRow.lesson_title || "",
    lessonId: firstRow.lesson_id ? String(firstRow.lesson_id) : "",
    timeMinutes: Number(firstRow.time ?? 0),
    grade: firstRow.grade_class || "",
    exported: Boolean(firstRow.isExported),
    saved: Boolean(firstRow.isSaved),
    deleted: Boolean(firstRow.isDeleted),
    questions: Array.from(questionsMap.values()).sort(
      (left, right) => left.order - right.order,
    ),
  };
};

exports.search = async (filters = {}) => {
  let sql = `
    SELECT
      pe.practice_exam_id,
      pe.lesson_id,
      pe.title,
      pe.time,
      pe.subject,
      pe.grade_class,
      pe.isExported,
      pe.isSaved,
      pe.isDeleted,
      l.title AS lesson_title,
      COUNT(DISTINCT eq.question_id) AS question_count
    FROM PracticeExam pe
    LEFT JOIN Lesson l
      ON pe.lesson_id = l.lesson_id
    LEFT JOIN ExamQuestion eq
      ON pe.practice_exam_id = eq.practice_exam_id
    WHERE 1 = 1
  `;
  const params = [];

  if (filters.title) {
    sql += " AND pe.title LIKE ?";
    params.push(`%${filters.title}%`);
  }

  if (filters.subject) {
    sql += " AND pe.subject LIKE ?";
    params.push(`%${filters.subject}%`);
  }

  if (filters.grade_class) {
    sql += " AND pe.grade_class LIKE ?";
    params.push(`%${filters.grade_class}%`);
  }

  if (filters.isExported !== undefined) {
    sql += " AND pe.isExported = ?";
    params.push(Boolean(filters.isExported));
  }

  if (filters.isSaved !== undefined) {
    sql += " AND pe.isSaved = ?";
    params.push(Boolean(filters.isSaved));
  }

  if (filters.isDeleted !== undefined) {
    sql += " AND pe.isDeleted = ?";
    params.push(Boolean(filters.isDeleted));
  }

  sql += `
    GROUP BY
      pe.practice_exam_id,
      pe.lesson_id,
      pe.title,
      pe.time,
      pe.subject,
      pe.grade_class,
      pe.isExported,
      pe.isSaved,
      pe.isDeleted,
      l.title
    ORDER BY pe.practice_exam_id DESC
  `;

  const [rows] = await db.query(sql, params);
  return rows;
};

exports.getAllInfoPracticeExam = async () => {
  const [rows] = await db.query(`
    SELECT
      pe.practice_exam_id,
      pe.lesson_id,
      pe.title,
      pe.time,
      pe.subject,
      pe.grade_class,
      pe.isExported,
      pe.isSaved,
      pe.isDeleted,
      l.title AS lesson_title,
      COUNT(DISTINCT eq.question_id) AS question_count
    FROM PracticeExam pe
    LEFT JOIN Lesson l
      ON pe.lesson_id = l.lesson_id
    LEFT JOIN ExamQuestion eq
      ON pe.practice_exam_id = eq.practice_exam_id
    GROUP BY
      pe.practice_exam_id,
      pe.lesson_id,
      pe.title,
      pe.time,
      pe.subject,
      pe.grade_class,
      pe.isExported,
      pe.isSaved,
      pe.isDeleted,
      l.title
    ORDER BY pe.practice_exam_id DESC
  `);
  return rows;
};

exports.getAssignment = async (practice_exam_id, options = {}) => {
  const [rows] = await db.query(
    `
      SELECT
        pe.practice_exam_id,
        pe.lesson_id,
        pe.title,
        pe.time,
        pe.subject,
        pe.grade_class,
        pe.isExported,
        pe.isSaved,
        pe.isDeleted,
        l.title AS lesson_title,
        eq.number_of_question,
        q.question_id,
        q.question_text,
        q.imgurl,
        q.type,
        a.answer_id,
        a.answer_text,
        a.is_correct
      FROM PracticeExam pe
      LEFT JOIN Lesson l
        ON pe.lesson_id = l.lesson_id
      LEFT JOIN ExamQuestion eq
        ON pe.practice_exam_id = eq.practice_exam_id
      LEFT JOIN Question q
        ON eq.question_id = q.question_id
      LEFT JOIN Answer a
        ON q.question_id = a.question_id
      WHERE pe.practice_exam_id = ?
      ORDER BY eq.number_of_question ASC, a.answer_id ASC
    `,
    [practice_exam_id],
  );

  return mapExamRows(rows, options);
};

exports.getPublishedForClient = async (filters = {}) => {
  let sql = `
    SELECT
      pe.practice_exam_id,
      pe.lesson_id,
      pe.title,
      pe.time,
      pe.subject,
      pe.grade_class,
      pe.isExported,
      pe.isSaved,
      pe.isDeleted,
      l.title AS lesson_title,
      COUNT(DISTINCT eq.question_id) AS question_count
    FROM PracticeExam pe
    LEFT JOIN Lesson l
      ON pe.lesson_id = l.lesson_id
    LEFT JOIN ExamQuestion eq
      ON pe.practice_exam_id = eq.practice_exam_id
    WHERE pe.isDeleted = FALSE
      AND pe.isExported = TRUE
  `;
  const params = [];

  if (filters.keyword) {
    sql += `
      AND (
        pe.title LIKE ?
        OR pe.subject LIKE ?
        OR pe.grade_class LIKE ?
        OR COALESCE(l.title, '') LIKE ?
      )
    `;
    const keyword = `%${filters.keyword}%`;
    params.push(keyword, keyword, keyword, keyword);
  }

  sql += `
    GROUP BY
      pe.practice_exam_id,
      pe.lesson_id,
      pe.title,
      pe.time,
      pe.subject,
      pe.grade_class,
      pe.isExported,
      pe.isSaved,
      pe.isDeleted,
      l.title
    ORDER BY pe.practice_exam_id DESC
  `;

  const [rows] = await db.query(sql, params);
  return rows.map((row) => ({
    id: String(row.practice_exam_id),
    title: row.title,
    subject: row.subject,
    lesson: row.lesson_title || "",
    lessonId: row.lesson_id ? String(row.lesson_id) : "",
    timeMinutes: Number(row.time ?? 0),
    grade: row.grade_class || "",
    exported: Boolean(row.isExported),
    saved: Boolean(row.isSaved),
    deleted: Boolean(row.isDeleted),
    questionCount: Number(row.question_count ?? 0),
  }));
};

exports.getPublishedExamDetailForClient = async (
  practice_exam_id,
  options = {},
) => {
  const exam = await exports.getAssignment(practice_exam_id, options);

  if (!exam || exam.deleted || !exam.exported) {
    return null;
  }

  return exam;
};

exports.createExam = async (examData) => {
  const normalizedExam = normalizeExamPayload(examData);
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [examResult] = await connection.query(
      `
        INSERT INTO PracticeExam
          (course_id, lesson_id, title, time, subject, grade_class, isExported, isSaved, isDeleted)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE)
      `,
      [
        examData.course_id ?? null,
        normalizedExam.lessonId,
        normalizedExam.title,
        normalizedExam.time,
        normalizedExam.subject,
        normalizedExam.grade,
        normalizedExam.exported,
        normalizedExam.saved,
      ],
    );

    const examId = examResult.insertId;

    for (let index = 0; index < normalizedExam.questions.length; index += 1) {
      const question = normalizedExam.questions[index];

      const [questionResult] = await connection.query(
        `
          INSERT INTO Question
            (question_text, imgurl, type, subject, chapter, grade_class, difficulty, solution, practice_exam_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          question.content,
          question.imgUrl,
          question.type,
          normalizedExam.subject,
          "",
          normalizedExam.grade,
          "",
          "",
          examId,
        ],
      );

      const questionId = questionResult.insertId;

      for (const answer of question.answer) {
        await connection.query(
          `
            INSERT INTO Answer (question_id, answer_text, is_correct)
            VALUES (?, ?, ?)
          `,
          [questionId, answer.content, answer.isCorrect],
        );
      }

      await connection.query(
        `
          INSERT INTO ExamQuestion (practice_exam_id, question_id, number_of_question)
          VALUES (?, ?, ?)
        `,
        [examId, questionId, index + 1],
      );
    }

    await connection.commit();
    return { success: true, examId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.updateExam = async (practice_exam_id, examData) => {
  const normalizedExam = normalizeExamPayload(examData);
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [updateResult] = await connection.query(
      `
        UPDATE PracticeExam
        SET
          lesson_id = ?,
          title = ?,
          time = ?,
          subject = ?,
          grade_class = ?,
          isExported = ?,
          isSaved = ?,
          isDeleted = ?
        WHERE practice_exam_id = ?
      `,
      [
        normalizedExam.lessonId,
        normalizedExam.title,
        normalizedExam.time,
        normalizedExam.subject,
        normalizedExam.grade,
        normalizedExam.exported,
        normalizedExam.saved,
        normalizedExam.deleted,
        practice_exam_id,
      ],
    );

    if (updateResult.affectedRows === 0) {
      throw new Error("Exam not found");
    }

    await deleteExamDependencies(connection, practice_exam_id);

    for (let index = 0; index < normalizedExam.questions.length; index += 1) {
      const question = normalizedExam.questions[index];

      const [questionResult] = await connection.query(
        `
          INSERT INTO Question
            (question_text, imgurl, type, subject, chapter, grade_class, difficulty, solution, practice_exam_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          question.content,
          question.imgUrl,
          question.type,
          normalizedExam.subject,
          "",
          normalizedExam.grade,
          "",
          "",
          practice_exam_id,
        ],
      );

      const questionId = questionResult.insertId;

      for (const answer of question.answer) {
        await connection.query(
          `
            INSERT INTO Answer (question_id, answer_text, is_correct)
            VALUES (?, ?, ?)
          `,
          [questionId, answer.content, answer.isCorrect],
        );
      }

      await connection.query(
        `
          INSERT INTO ExamQuestion (practice_exam_id, question_id, number_of_question)
          VALUES (?, ?, ?)
        `,
        [practice_exam_id, questionId, index + 1],
      );
    }

    await connection.commit();
    return { success: true, examId: Number(practice_exam_id) };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.updateExamStatus = async (practice_exam_id, examData = {}) => {
  const normalizedExam = normalizeExamPayload(examData);

  const [result] = await db.query(
    `
      UPDATE PracticeExam
      SET
        isExported = ?,
        isSaved = ?,
        isDeleted = ?
      WHERE practice_exam_id = ?
    `,
    [
      normalizedExam.exported,
      normalizedExam.saved,
      normalizedExam.deleted,
      practice_exam_id,
    ],
  );

  if (result.affectedRows === 0) {
    throw new Error("Exam not found");
  }

  return result;
};

exports.getAdminExamDetail = async (practice_exam_id) => {
  const exam = await exports.getAssignment(practice_exam_id, {
    includeCorrectAnswers: true,
  });

  if (!exam) {
    return null;
  }

  return {
    id: exam.id,
    title: exam.title,
    subject: exam.subject,
    lesson: exam.lesson,
    lessonId: exam.lessonId,
    time: exam.timeMinutes,
    grade: exam.grade,
    exported: exam.exported,
    saved: exam.saved,
    deleted: exam.deleted,
    questions: exam.questions.map((question) => ({
      id: question.id,
      content: question.content,
      type: Number(question.type),
      imgUrl: question.imgUrl,
      answer: question.answers.map((answer) => ({
        id: answer.id,
        content: answer.content,
        isCorrect: Boolean(answer.isCorrect),
      })),
    })),
  };
};

exports.getAdminExamList = async () => {
  const rows = await exports.getAllInfoPracticeExam();
  return rows.map((row) => ({
    id: String(row.practice_exam_id),
    title: row.title,
    subject: row.subject,
    lesson: row.lesson_title || "",
    lessonId: row.lesson_id ? String(row.lesson_id) : "",
    time: Number(row.time ?? 0),
    grade: row.grade_class || "",
    exported: Boolean(row.isExported),
    saved: Boolean(row.isSaved),
    deleted: Boolean(row.isDeleted),
    questionCount: Number(row.question_count ?? 0),
  }));
};

exports.exportExam = async (practice_exam_id) => {
  const [result] = await db.query(
    `
      UPDATE PracticeExam
      SET isExported = TRUE,
          isSaved = FALSE,
          isDeleted = FALSE
      WHERE practice_exam_id = ?
    `,
    [practice_exam_id],
  );

  if (result.affectedRows === 0) {
    throw new Error("Exam not found");
  }

  return result;
};

exports.saveExam = async (practice_exam_id) => {
  const [result] = await db.query(
    `
      UPDATE PracticeExam
      SET isExported = FALSE,
          isSaved = TRUE,
          isDeleted = FALSE
      WHERE practice_exam_id = ?
    `,
    [practice_exam_id],
  );

  if (result.affectedRows === 0) {
    throw new Error("Exam not found");
  }

  return result;
};

exports.deleteSoftExam = async (practice_exam_id) => {
  const [result] = await db.query(
    `
      UPDATE PracticeExam
      SET isExported = FALSE,
          isSaved = FALSE,
          isDeleted = TRUE
      WHERE practice_exam_id = ?
    `,
    [practice_exam_id],
  );

  if (result.affectedRows === 0) {
    throw new Error("Exam not found");
  }

  return result;
};

exports.deleteExam = async (practice_exam_id) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    await deleteExamDependencies(connection, practice_exam_id);

    const [result] = await connection.query(
      "DELETE FROM PracticeExam WHERE practice_exam_id = ?",
      [practice_exam_id],
    );

    if (result.affectedRows === 0) {
      throw new Error("Exam not found");
    }

    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
