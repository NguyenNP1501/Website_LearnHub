const db = require('../../configs/database.config');

const CourseModel = {
  //1.LẤY DANH SÁCH KHÓA HỌC THEO KHỐI & MÔN
  findByGrade: async (gradeId, subjectId = null) => {
    let sql = `
      SELECT 
        c.*, 
        c.course_id AS id, 
        c.course_name AS title,
        c.teacher_id,
        u.user_name AS teacher_name 
      FROM course c
      LEFT JOIN teacher t ON c.teacher_id = t.teacher_id
      LEFT JOIN user u ON t.teacher_id = u.user_id
      WHERE c.grade_id = ?
    `;
    
    const params = [gradeId];
    
    if (subjectId && subjectId !== 'all') {
      sql += ` AND c.subject_id = ?`;
      params.push(subjectId);
    }
    
    const [rows] = await db.query(sql, params);
    return rows;
  },

  //2. LẤY THÔNG TIN CHI TIẾT 1 KHÓA HỌC
  findById: async (courseId) => {
    const query = `
      SELECT 
        c.*, 
        c.course_id AS id, 
        c.course_name AS title,
        c.teacher_id,
        u.user_name AS teacher_name 
      FROM course c
      LEFT JOIN teacher t ON c.teacher_id = t.teacher_id
      LEFT JOIN user u ON t.teacher_id = u.user_id
      WHERE c.course_id = ?
    `;
    const [rows] = await db.query(query, [courseId]);
    return rows;
  },

  //3.LẤY DANH SÁCH BÀI HỌC CỦA KHÓA HỌC (SẮP XẾP THEO BÀI TỰ NHIÊN)
  findLessonsByCourseId: async (courseId) => {
    const [rows] = await db.query('SELECT *, lesson_id AS id FROM lesson WHERE course_id = ?', [courseId]);
    
    // Tách số từ tiêu đề "Bài X" để sắp xếp chuẩn theo thứ tự tăng dần 1, 2, 3...
    return rows.sort((a, b) => {
      const matchA = (a.title || '').match(/\d+/);
      const matchB = (b.title || '').match(/\d+/);
      
      const numA = matchA ? parseInt(matchA[0], 10) : 0;
      const numB = matchB ? parseInt(matchB[0], 10) : 0;
      
      return numA - numB;
    });
  },

  //4.THÊM KHÓA HỌC MỚI
  create: async (courseData) => {
    const sql = `
      INSERT INTO course (course_name, subject_id, grade_id, description, teacher_id, img_url) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      courseData.course_name,
      courseData.subject_id, 
      courseData.grade_id,   
      courseData.description,
      courseData.teacher_id,
      courseData.img_url
    ];

    const [result] = await db.query(sql, values);
    return result.insertId;
  },
  
  //5.XÓA KHÓA HỌC
  delete: async (courseId) => {
    const [result] = await db.query('DELETE FROM course WHERE course_id = ?', [courseId]);
    return result;
  },

  // 6.CẬP NHẬT KHÓA HỌC
  update: async (courseId, courseData) => {
    const { course_name, subject_id, grade_id, description, img_url } = courseData;
    
    if (img_url) {
      const query = `UPDATE course SET course_name=?, subject_id=?, grade_id=?, description=?, img_url=? WHERE course_id=?`;
      const [result] = await db.query(query, [course_name, Number(subject_id), Number(grade_id), description, img_url, courseId]);
      return result;
    } else {
      const query = `UPDATE course SET course_name=?, subject_id=?, grade_id=?, description=? WHERE course_id=?`;
      const [result] = await db.query(query, [course_name, Number(subject_id), Number(grade_id), description, courseId]);
      return result;
    }
  }
};

module.exports = CourseModel;