const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const upload = require('../middlewares/upload');

// Cấu hình multer để nhận cùng lúc 2 file (video và ảnh bìa)
const uploadFields = upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

// API: POST /api/lessons (Tạo bài giảng mới)
router.post('/', uploadFields, async (req, res) => {
  try {
    // 1. Nhận các text từ form React
    const { title, chapter, content, course_id } = req.body;

    // 2. Lấy link file ảnh và video vừa tải lên
    const videoUrl = req.files && req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : null;
    const imgUrl = req.files && req.files['thumbnail'] ? `/uploads/${req.files['thumbnail'][0].filename}` : null;
    
    const status = "active"; 
    

    // 3. Lưu toàn bộ vào Database
    const query = `
      INSERT INTO lesson (course_id, title, chapter, content, img_url, video_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      course_id, title, chapter, content, imgUrl, videoUrl, status
    ]);

    res.status(201).json({
      message: 'Đăng bài giảng thành công!',
      lessonId: result.insertId
    });

  } catch (error) {
    console.error("Lỗi khi upload bài giảng:", error);
    res.status(500).json({ message: "Lỗi Server khi upload file!" });
  }

});
// API: GET /api/lessons/:id (Lấy chi tiết 1 bài học để xem video)
router.get('/:id', async (req, res) => {
  try {
    const lessonId = req.params.id;
    const [rows] = await db.query('SELECT * FROM lesson WHERE lesson_id = ?', [lessonId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài giảng!" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Lỗi lấy bài giảng:", error);
    res.status(500).json({ message: "Lỗi Server!" });
  }
});

module.exports = router;