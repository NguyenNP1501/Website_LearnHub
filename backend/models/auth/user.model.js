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
exports.createUser = async (userData) => {
    // ĐÃ SỬA: Đồng bộ tên key nhận vào giống với Controller và findByEmail
    const { userName, email, password, role, school, gradeClass, specialization } = userData;
    
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Lưu thông tin chung vào bảng `user`
      const [userResult] = await connection.query(
        'INSERT INTO user (user_name, email, password, role, avatar_url) VALUES (?, ?, ?, ?, ?)',
        [userName, email, password, role] // Đã đổi sang biến mới truyền vào câu lệnh SQL
      );

      const newUserId = userResult.insertId;

      // 2. Phân luồng chính xác dựa trên Role tiếng Anh đã chuẩn hóa
      if (role === 'admin') {
        await connection.query(
          'INSERT INTO teacher (teacher_id, specialization) VALUES (?, ?)',
          [newUserId, specialization] // Đã đổi thành specialization
        );
      } else if (role === 'student') {
        await connection.query(
          'INSERT INTO student (student_id, school, grade_class) VALUES (?, ?, ?)',
          [newUserId, school, gradeClass] // Đã đổi thành gradeClass
        );
      }

      await connection.commit();
      return newUserId;

    } catch (error) {
      await connection.rollback();
      throw error; 
    } finally {
      connection.release();
    }
};
