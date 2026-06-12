const db = require('../configs/database.config');

const profileModel = {
    // 1. Lấy thông tin cơ bản kèm thông tin trường lớp học sinh
    getUserStudentInfo: async (userId) => {
        const query = `
            SELECT u.user_id, u.user_name AS username, u.email, u.role, s.school, s.grade_class
            FROM user u
            LEFT JOIN student s ON u.user_id = s.student_id
            WHERE u.user_id = ?
        `;
        const [rows] = await db.query(query, [userId]);
        return rows[0] || null;
    },

    // 2. Lấy danh sách khóa học học sinh đăng ký đang hoạt động
    getEnrolledCourses: async (studentId) => {
        const query = `
            SELECT sc.course_id, sc.progress, c.course_name, c.img_url
            FROM student_course sc
            JOIN course c ON sc.course_id = c.course_id
            WHERE sc.student_id = ? AND sc.status IN ('Đang học', 'Hoàn thành')
        `;
        const [rows] = await db.query(query, [studentId]);
        return rows;
    },

    // 3. THỐNG KÊ SỐ LƯỢNG 
    getStudentStats: async (studentId) => {
        const query = `
            SELECT 
                (SELECT IFNULL(SUM(watch_time), 0) FROM student_lesson WHERE student_id = ?) as totalWatchTime,
                (SELECT COUNT(*) FROM attempt WHERE student_id = ?) as totalExams,
                (SELECT COUNT(*) FROM student_course WHERE student_id = ? AND progress >= 100) as completedCourses
        `;
        const [rows] = await db.query(query, [studentId, studentId, studentId]);

        return {
            totalWatchTime: rows[0]?.totalWatchTime || 0,
            totalExams: rows[0]?.totalExams || 0,
            badges: rows[0]?.completedCourses || 0
        };
    },

    // 4. Lấy lịch sử 5 lượt làm đề gần nhất
    getRecentAttempts: async (studentId) => {
        const query = `
            SELECT a.attempt_id, a.score, a.submitted_at, pe.title as exam_title
            FROM attempt a
            JOIN practiceexam pe ON a.practice_exam_id = pe.practice_exam_id
            WHERE a.student_id = ?
            ORDER BY a.submitted_at DESC
            LIMIT 5
        `;
        const [rows] = await db.query(query, [studentId]);
        return rows;
    },

    // ================= KHU VỰC THÊM MỚI =================

    // 5. Cập nhật thông tin cá nhân (Cập nhật song song cả bảng user và student)
    updateProfileInfo: async (userId, name, school, grade) => {
        // Cập nhật tên hiển thị ở bảng user
        const queryUser = `UPDATE user SET user_name = ? WHERE user_id = ?`;
        await db.query(queryUser, [name, userId]);

        /* 
          Vì hàm số 1 của bạn dùng LEFT JOIN student, đề phòng trường hợp tài khoản 
          mới lập chưa có dòng tương ứng bên bảng student, ta dùng câu lệnh 
          INSERT ... ON DUPLICATE KEY UPDATE để tự động thêm mới nếu chưa có, hoặc cập nhật nếu đã có.
        */
        const queryStudent = `
            INSERT INTO student (student_id, school, grade_class) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE school = ?, grade_class = ?
        `;
        await db.query(queryStudent, [userId, school, grade, school, grade]);
        return true;
    },

    // 6. Lấy mật khẩu mã hóa (hash) hiện tại để phục vụ so sánh bcrypt
    getUserPassword: async (userId) => {
        const query = `SELECT password FROM user WHERE user_id = ?`;
        const [rows] = await db.query(query, [userId]);
        return rows[0]?.password || null; // Giả định tên cột mật khẩu trong DB của bạn là 'password'
    },

    // 7. Cập nhật mật khẩu mới đã mã hóa vào bảng user
    updatePassword: async (userId, hashedPassword) => {
        const query = `UPDATE user SET password = ? WHERE user_id = ?`;
        await db.query(query, [hashedPassword, userId]);
        return true;
    }
};

module.exports = profileModel;