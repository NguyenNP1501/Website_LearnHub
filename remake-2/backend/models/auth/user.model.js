const db = require("../../configs/database.config");

exports.findByEmail = async (email) => {
  const [rows] = await db.query(
    `
      SELECT
        u.user_id AS userId,
        u.user_name AS userName,
        u.email,
        u.password,
        LOWER(TRIM(u.role)) AS role,
        s.student_id AS studentId,
        s.school,
        s.grade_class AS gradeClass,
        t.teacher_id AS teacherId,
        t.specialization
      FROM user u
      LEFT JOIN student s
        ON s.student_id = u.user_id
      LEFT JOIN teacher t
        ON t.teacher_id = u.user_id
      WHERE LOWER(u.email) = LOWER(?)
      LIMIT 1
    `,
    [email],
  );

  return rows[0] ?? null;
};
