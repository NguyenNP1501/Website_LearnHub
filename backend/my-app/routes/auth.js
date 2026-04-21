const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// API: POST /api/auth/register (Đăng ký tài khoản)
router.post('/register', async (req, res) => {
  // Dữ liệu từ form React gửi lên
  const { full_name, email, password, role, school, class_name, major } = req.body;

  // Lấy một kết nối riêng từ Pool để thực hiện Transaction
  const connection = await db.getConnection();

  try {
    // Bắt đầu Transaction (Khóa an toàn dữ liệu)
    await connection.beginTransaction();

    // 1. Kiểm tra xem Email đã tồn tại trong bảng `user` chưa
    const [existingUsers] = await connection.query('SELECT * FROM user WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      await connection.rollback(); // Dừng Transaction
      return res.status(400).json({ message: "Email này đã được sử dụng!" });
    }

    // 2. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Lưu thông tin chung vào bảng `user`
    const [userResult] = await connection.query(
      'INSERT INTO user (user_name, email, password, role) VALUES (?, ?, ?, ?)',
      [full_name, email, hashedPassword, role]
    );

    // Lấy ID của user vừa được tạo
    const newUserId = userResult.insertId;

    // 4. Phân luồng: Lưu thông tin riêng vào bảng `teacher` hoặc `student`
    if (role === 'Giáo viên') {
      await connection.query(
        'INSERT INTO teacher (teacher_id, specialization) VALUES (?, ?)',
        [newUserId, major]
      );
    } else if (role === 'Học sinh') {
      await connection.query(
        'INSERT INTO student (student_id, school, grade_class) VALUES (?, ?, ?)',
        [newUserId, school, class_name]
      );
    }

    // Nếu mọi thứ đều suôn sẻ, xác nhận lưu vĩnh viễn vào Database (Commit)
    await connection.commit();
    res.status(201).json({ message: "Đăng ký tài khoản thành công!" });

  } catch (error) {
    // Nếu có bất kỳ lỗi gì xảy ra ở các bước trên, hủy bỏ tất cả thao tác (Rollback)
    await connection.rollback();
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi Server!" });
  } finally {
    // Trả lại kết nối cho hệ thống (Rất quan trọng để không bị sập Server)
    connection.release();
  }
});

module.exports = router;