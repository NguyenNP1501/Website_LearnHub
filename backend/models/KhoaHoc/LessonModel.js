// File: backend/models/KhoaHoc/LessonModel.js
const db = require('../../configs/database.config');

const LessonModel = {
  //1. THÊM BÀI GIẢNG MỚI
  create: async (lessonData) => {
    // Đã đồng bộ cấu trúc bóc tách tên trường thumbnail_url và video_url từ Controller
    const { course_id, title, chapter, content, thumbnail_url, video_url, status } = lessonData;
    
    const query = `
      INSERT INTO lesson (course_id, title, chapter, content, img_url, video_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [
      course_id, 
      title || '', 
      chapter || '', 
      content || '', 
      thumbnail_url || null, 
      video_url || null, 
      status || 'Active'
    ]);
    return result.insertId;
  },

  //2.LẤY CHI TIẾT BÀI GIẢNG THEO ID
  findById: async (lessonId) => {
    const [rows] = await db.query('SELECT * FROM lesson WHERE lesson_id = ?', [lessonId]);
    return rows; // Trả về mảng chứa record kết quả để Controller bóc tách rows[0]
  },

  //3.CẬP NHẬT THÔNG TIN BÀI GIẢNG
  update: async (lessonId, lessonData) => {
    const { course_id, title, chapter, content, thumbnail_url, video_url, status } = lessonData;
    
    const query = `
      UPDATE lesson 
      SET course_id = ?, title = ?, chapter = ?, content = ?, img_url = ?, video_url = ?, status = ?
      WHERE lesson_id = ?
    `;
    
    const [result] = await db.query(query, [
      course_id,
      title,
      chapter,
      content,
      thumbnail_url,  
      video_url,
      status,
      lessonId      
    ]);
    return result;
  },

  //4.XÓA BÀI GIẢNG KHỎI HỆ THỐNG
  delete: async (lessonId) => {
    const query = 'DELETE FROM lesson WHERE lesson_id = ?';
    const [result] = await db.query(query, [lessonId]);
    return result;
  },

  //5.TÌM ID BÀI TRƯỚC VÀ BÀI TIẾP THEO (ĐÃ LỌC BÀI ẨN)
  findNextAndPrev: async (courseId, lessonId) => {
    // 1. Tìm bài học TRƯỚC ĐÓ (Có ID nhỏ hơn hiện tại, thuộc cùng khóa học và phải hiển thị Active)
    const [prevRows] = await db.query(
      'SELECT lesson_id FROM lesson WHERE course_id = ? AND lesson_id < ? AND status = "Active" ORDER BY lesson_id DESC LIMIT 1',
      [courseId, lessonId]
    );

    // 2. Tìm bài học TIẾP THEO (Có ID lớn hơn hiện tại, thuộc cùng khóa học và phải hiển thị Active)
    const [nextRows] = await db.query(
      'SELECT lesson_id FROM lesson WHERE course_id = ? AND lesson_id > ? AND status = "Active" ORDER BY lesson_id ASC LIMIT 1',
      [courseId, lessonId]
    );

    return {
      prev_lesson_id: prevRows.length > 0 ? prevRows[0].lesson_id : null,
      next_lesson_id: nextRows.length > 0 ? nextRows[0].lesson_id : null
    };
  }
};

module.exports = LessonModel;