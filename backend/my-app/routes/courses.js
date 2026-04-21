var express = require('express');
var router = express.Router();
const db = require('../config/db'); 
const upload = require('../middlewares/upload');

// ==========================================
// API 1: LẤY DANH SÁCH KHÓA HỌC THEO LỚP
// GET http://localhost:3000/api/courses?grade=Lớp 1
// ==========================================
router.get('/', async function(req, res) {
  try {
    const requestedGrade = req.query.grade || 'Lớp 1';
    const [rows] = await db.query('SELECT * FROM course WHERE grade_class = ?', [requestedGrade]);



    // 3. Chế biến lại dữ liệu trước khi gửi về React
    const formattedCourses = rows.map((courseItem, index) => {
      return {
        id: courseItem.course_id,       
        title: courseItem.course_name, 
        subject: courseItem.subject,
        img_url: courseItem.img_url
      };
    });
    
    res.json(formattedCourses);

  } catch (error) {
    console.error("Lỗi Database:", error);
    res.status(500).json({ message: "Lỗi kết nối CSDL!" });
  }
});

// ==========================================
// API 2: LẤY CHI TIẾT 1 KHÓA HỌC + BÀI HỌC
// GET http://localhost:3000/api/courses/1
// ==========================================
router.get('/:id', async function(req, res) {
  try {
    const courseId = req.params.id;

    // Lấy thông tin chung của khóa học
    const [courseInfoRows] = await db.query('SELECT * FROM course WHERE course_id = ?', [courseId]);
    
    if (courseInfoRows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy khóa học này!" });
    }
    const course = courseInfoRows[0];

    // Lấy danh sách các bài học thuộc khóa học này
    const [lessonRows] = await db.query('SELECT * FROM lesson WHERE course_id = ?', [courseId]);

    // Gom nhóm bài học theo từng "Chương"
    const chaptersMap = {};
    lessonRows.forEach(lesson => {
      if (!chaptersMap[lesson.chapter]) {
        chaptersMap[lesson.chapter] = {
          id: lesson.chapter,
          title: lesson.chapter,
          lessons: []
        };
      }
      
      chaptersMap[lesson.chapter].lessons.push({
        id: lesson.lesson_id,
        title: lesson.title,
        progress: 0,
        // ==================================================
        // ĐÃ BỔ SUNG: Truyền link ảnh bài học xuống cho React
        // ==================================================
        thumbnail: lesson.img_url 
      });
    });

    const formattedChapters = Object.values(chaptersMap);

    const responseData = {
      info: {
        title: course.course_name,
        teacher: "...", 
        progress: 0,
        completedLessons: 0,
        totalLessons: lessonRows.length
      },
      chapters: formattedChapters
    };

    res.json(responseData);

  } catch (error) {
    console.error("Lỗi khi lấy chi tiết khóa học:", error);
    res.status(500).json({ message: "Lỗi kết nối CSDL!" });
  }
});

// ==========================================
// API 3: TẠO KHÓA HỌC MỚI (CÓ UPLOAD ẢNH)
// POST http://localhost:3000/api/courses
// ==========================================
router.post('/', upload.single('thumbnail'), async function(req, res) {
  try {
    const { course_name, subject, grade_class, description } = req.body;
    
    // Fix cứng ID giáo viên
    const teacher_id = null; 

    // Lấy link ảnh từ multer
    const img_url = req.file ? `/uploads/${req.file.filename}` : null;

    const query = `
      INSERT INTO course (course_name, subject, grade_class, description, teacher_id, img_url) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      course_name, 
      subject, 
      grade_class, 
      description, 
      teacher_id,   
      img_url       
    ]);

    res.status(201).json({ 
      message: "Tạo khóa học thành công!", 
      courseId: result.insertId 
    });

  } catch (error) {
    console.error("Lỗi khi tạo khóa học:", error);
    res.status(500).json({ message: "Lỗi kết nối CSDL!" });
  }
});

module.exports = router;