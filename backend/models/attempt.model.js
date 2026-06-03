const db = require("../../configs/database.config");

exports.createAttempt = async ({studentId = null, practiceExamId, score, timeSpentSeconds,  questionResults, }) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [attemptResult] = await connection.query(
      `
        INSERT INTO Attempt (student_id, practice_exam_id, score, time)
        VALUES (?, ?, ?, ?)
      `,
      [studentId, practiceExamId, score, timeSpentSeconds],
    );

    const attemptId = attemptResult.insertId;

    for (const questionResult of questionResults) {
      const [studentAnswerResult] = await connection.query(
        `
          INSERT INTO student_answer (student_id, question_id, answer_id, answer_text)
          VALUES (?, ?, ?, ?)
        `,
        [
          studentId,
          Number(questionResult.id),
          questionResult.selectedAnswerId
            ? Number(questionResult.selectedAnswerId)
            : null,
          questionResult.studentAnswerLabel || null,
        ],
      );

      await connection.query(
        `
          INSERT INTO student_answer_attempt (student_answer_id, attempt_id)
          VALUES (?, ?)
        `,
        [studentAnswerResult.insertId, attemptId],
      );
    }

    await connection.commit();

    const [attemptRows] = await db.query(
      `
        SELECT
          attempt_id AS attemptId,
          time AS timeSpentSeconds,
          submitted_at AS submittedAt
        FROM Attempt
        WHERE attempt_id = ?
      `,
      [attemptId],
    );

    return attemptRows[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.searchHistory = async ({ studentId = null, keyword = "" } = {}) => {
  let sql = `
    SELECT
      atp.attempt_id AS id,
      atp.practice_exam_id AS examId,
      pe.title AS examTitle,
      pe.subject,
      COALESCE(l.title, '') AS lesson,
      COALESCE(pe.grade_class, '') AS grade,
      pe.time AS timeMinutes,
      atp.time AS timeSpentSeconds,
      atp.score,
      atp.submitted_at AS submittedAt,
      (
        SELECT COUNT(*)
        FROM ExamQuestion eq
        WHERE eq.practice_exam_id = atp.practice_exam_id
      ) AS totalQuestions,
      (
        SELECT COUNT(*)
        FROM student_answer_attempt saa
        JOIN student_answer sa
          ON sa.student_answer_id = saa.student_answer_id
        JOIN Answer ans
          ON ans.answer_id = sa.answer_id
        WHERE saa.attempt_id = atp.attempt_id
          AND ans.is_correct = TRUE
      ) AS correctCount,
      (
        SELECT COUNT(*)
        FROM student_answer_attempt saa
        JOIN student_answer sa
          ON sa.student_answer_id = saa.student_answer_id
        WHERE saa.attempt_id = atp.attempt_id
          AND COALESCE(sa.answer_text, '') <> ''
      ) AS answeredCount
    FROM Attempt atp
    JOIN PracticeExam pe
      ON atp.practice_exam_id = pe.practice_exam_id
    LEFT JOIN Lesson l
      ON pe.lesson_id = l.lesson_id
    WHERE 1 = 1
  `;

  const params = [];

  if (studentId !== null && studentId !== undefined && studentId !== "") {
    sql += " AND atp.student_id = ?";
    params.push(studentId);
  }

  if (keyword) {
    sql += `
      AND (
        pe.title LIKE ?
        OR pe.subject LIKE ?
        OR COALESCE(l.title, '') LIKE ?
        OR COALESCE(pe.grade_class, '') LIKE ?
      )
    `;
    const searchKeyword = `%${keyword}%`;
    params.push(searchKeyword, searchKeyword, searchKeyword, searchKeyword);
  }

  sql += `
    ORDER BY atp.attempt_id DESC
  `;

  const [rows] = await db.query(sql, params);
  return rows.map((row) => ({
    id: String(row.id),
    examId: String(row.examId),
    examTitle: row.examTitle,
    subject: row.subject,
    lesson: row.lesson,
    grade: row.grade,
    timeMinutes: Number(row.timeMinutes ?? 0),
    timeSpentSeconds: Number(row.timeSpentSeconds ?? 0),
    score: Number(row.score ?? 0),
    submittedAt: row.submittedAt,
    totalQuestions: Number(row.totalQuestions ?? 0),
    correctCount: Number(row.correctCount ?? 0),
    unansweredCount:
      Number(row.totalQuestions ?? 0) - Number(row.answeredCount ?? 0),
  }));
};

exports.getAttemptBaseById = async (attemptId, studentId = null) => {
  let sql = `
    SELECT
      atp.attempt_id AS attemptId,
      atp.student_id AS studentId,
      atp.practice_exam_id AS practiceExamId,
      atp.score,
      atp.time AS timeSpentSeconds,
      atp.submitted_at AS submittedAt
    FROM Attempt atp
    WHERE atp.attempt_id = ?
  `;
  const params = [attemptId];

  if (studentId !== null && studentId !== undefined && studentId !== "") {
    sql += " AND atp.student_id = ?";
    params.push(studentId);
  }

  const [rows] = await db.query(sql, params);
  return rows[0] ?? null;
};

exports.getAnswersByAttemptId = async (attemptId) => {
  const [rows] = await db.query(
    `
      SELECT
        sa.question_id AS questionId,
        sa.answer_id AS answerId,
        sa.answer_text AS answerText
      FROM student_answer_attempt saa
      JOIN student_answer sa
        ON sa.student_answer_id = saa.student_answer_id
      WHERE saa.attempt_id = ?
    `,
    [attemptId],
  );
  
  return rows;
};

exports.deleteAttempt = async (attemptId, studentId = null) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [studentAnswerRows] = await connection.query(
      `
        SELECT sa.student_answer_id
        FROM student_answer_attempt saa
        JOIN student_answer sa
          ON sa.student_answer_id = saa.student_answer_id
        WHERE saa.attempt_id = ?
      `,
      [attemptId],
    );

    if (studentAnswerRows.length > 0) {
      const studentAnswerIds = studentAnswerRows.map(
        (row) => row.student_answer_id,
      );

      await connection.query(
        `
          DELETE FROM student_answer_attempt
          WHERE attempt_id = ?
        `,
        [attemptId],
      );

      await connection.query(
        `
          DELETE FROM student_answer
          WHERE student_answer_id IN (?)
        `,
        [studentAnswerIds],
      );
    }

    let deleteAttemptSql = "DELETE FROM Attempt WHERE attempt_id = ?";
    const deleteAttemptParams = [attemptId];

    if (studentId !== null && studentId !== undefined && studentId !== "") {
      deleteAttemptSql += " AND student_id = ?";
      deleteAttemptParams.push(studentId);
    }

    const [deleteAttemptResult] = await connection.query(
      deleteAttemptSql,
      deleteAttemptParams,
    );

    if (deleteAttemptResult.affectedRows === 0) {
      throw new Error("Attempt not found");
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
