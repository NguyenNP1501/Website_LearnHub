/*var express = require('express');
var router = express.Router();
const db = require('../config/db');

// Lấy danh sách bài thảo luận
router.get('/', async function(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM discussion ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Lỗi khi lấy thảo luận:', error);
    res.status(500).json({ message: 'Lỗi kết nối CSDL!' });
  }
});

// Tạo bài thảo luận mới
router.post('/', async function(req, res) {
  try {
    const { title, content, image_url } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Tiêu đề và nội dung là bắt buộc.' });
    }

    const [result] = await db.query(
      'INSERT INTO discussion (title, content, image_url) VALUES (?, ?, ?)',
      [title, content, image_url || null]
    );

    const [rows] = await db.query('SELECT * FROM discussion WHERE discussion_id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Lỗi khi tạo thảo luận:', error);
    res.status(500).json({ message: 'Lỗi kết nối CSDL!' });
  }
});

module.exports = router;*/
var express = require('express'); // import thư viện express để xử lý route
var router = express.Router(); // tạo đối tượng router riêng cho module này
const db = require('../config/db'); // import kết nối MySQL từ file config/db.js

// Lấy danh sách bài thảo luận
router.get('/', async function(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM discussion ORDER BY created_at DESC');
    // Thực hiện câu lệnh SQL lấy toàn bộ bảng discussion, sắp xếp theo thời gian mới nhất
    res.json(rows); // trả về kết quả dạng JSON cho client
  } catch (error) {
    console.error('Lỗi khi lấy thảo luận:', error); // log lỗi phía server
    res.status(500).json({ message: 'Lỗi kết nối CSDL!' }); // trả lỗi 500 nếu query thất bại
  }
});

// Tạo bài thảo luận mới
router.post('/', async function(req, res) {
  try {
    const { content, image_url } = req.body;
    // Lấy dữ liệu từ body request: content, image_url

    if (!content) {
      return res.status(400).json({ message: 'Nội dung là bắt buộc.' });
      // Nếu thiếu content thì trả lỗi 400, không tiếp tục chèn DB
    }

    const [result] = await db.query(
      'INSERT INTO discussion (content, image_url) VALUES (?, ?)',
      [content, image_url || null]
    );
    // Chèn 1 bản ghi mới vào bảng discussion.
    // Dùng dấu ? để tránh SQL injection và truyền giá trị bằng mảng thứ hai.
    // Nếu image_url trống thì dùng null.

    const [rows] = await db.query('SELECT * FROM discussion WHERE discussion_id = ?', [result.insertId]);
    // Lấy lại bản ghi vừa tạo theo discussion_id trả về từ `result.insertId`

    res.status(201).json(rows[0]);
    // Trả về bản ghi vừa tạo với status 201 (Created)
  } catch (error) {
    console.error('Lỗi khi tạo thảo luận:', error);
    // Log lỗi phía server nếu có exception
    res.status(500).json({ message: 'Lỗi kết nối CSDL!' });
    // Trả về lỗi 500 nếu có bất kỳ lỗi nào
  }
});

module.exports = router; // xuất router để app.js có thể dùng route này