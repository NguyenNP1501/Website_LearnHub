const db = require('../../configs/database.config');

const ProgressModel = {
    // 1. Đăng ký khóa học
    enrollCourse: async (studentId, courseId) => {
        // Kiểm tra xem đã đăng ký chưa
        const [exist] = await db.query('SELECT * FROM student_course WHERE student_id = ? AND course_id = ?', [studentId, courseId]);

        if (exist.length === 0) {
            // Nếu chưa có thì thêm mới vào bảng
            const query = `
        INSERT INTO student_course (student_id, course_id, status, progress, enrolled_at) 
        VALUES (?, ?, 'Đang học', 0, NOW())
      `;
            const [result] = await db.query(query, [studentId, courseId]);
            return result.insertId;
        }
        
        return exist[0].id || { studentId, courseId };
    },

    // 2. Lưu tiến độ xem Video
    updateLessonProgress: async (studentId, lessonId, watchTime, duration) => {
        // Tính phần trăm tiến độ bài học hiện tại
        const progress = duration > 0 ? Math.round((watchTime / duration) * 100) : 0;
        const status = progress >= 90 ? 'Hoàn thành' : 'Đang học'; // Xem trên 90% coi như xong

        // Nếu chưa có thì INSERT, nếu có rồi thì UPDATE thời gian xem
        const query = `
      INSERT INTO student_lesson (student_id, lesson_id, status, watch_time, duration, progress, last_accessed)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
      watch_time = VALUES(watch_time), 
      duration = VALUES(duration), 
      progress = VALUES(progress), 
      status = VALUES(status), 
      last_accessed = NOW()
    `;
        const [result] = await db.query(query, [studentId, lessonId, status, watchTime, duration, progress]);

        // TỰ ĐỘNG CẬP NHẬT TIẾN ĐỘ TỔNG CỦA KHÓA HỌC:
        try {
            const [lessons] = await db.query('SELECT course_id FROM lesson WHERE lesson_id = ?', [lessonId]);
            if (lessons.length > 0) {
                const courseId = lessons[0].course_id;
                // Gọi hàm tính toán lại phần trăm hoàn thành của toàn khóa học
                await ProgressModel.calculateAndUpdateCourseProgress(studentId, courseId);
            }
        } catch (courseErr) {
            console.error("Lỗi tự động đồng bộ tiến độ tổng của khóa học:", courseErr);
        }

        return result;
    },

    // 3. Kiểm tra thông tin đăng ký khóa học
    checkEnrollment: async (studentId, courseId) => {
        const [rows] = await db.query(
            'SELECT * FROM student_course WHERE student_id = ? AND course_id = ?',
            [studentId, courseId]
        );
        return rows.length > 0 ? rows[0] : null;
    },

    // 4. Lấy tiến độ thời gian xem của một bài học cụ thể
    getLessonProgress: async (studentId, lessonId) => {
        const [rows] = await db.query(
            'SELECT watch_time FROM student_lesson WHERE student_id = ? AND lesson_id = ?',
            [studentId, lessonId]
        );
        return rows.length > 0 ? rows[0] : null;
    },

    // 5. Tính toán lại phần trăm hoàn thành khóa học dựa trên số bài học đã "Hoàn thành"
    calculateAndUpdateCourseProgress: async (studentId, courseId) => {
        // 1. Đếm tổng số bài học đang hoạt động (Active) của khóa đó
        const [[{ total }]] = await db.query(
            'SELECT COUNT(*) as total FROM lesson WHERE course_id = ? AND status = "Active"',
            [courseId]
        );

        // 2. Đếm số bài học mà học viên này đã đạt trạng thái "Hoàn thành"
        const [[{ completed }]] = await db.query(
            `SELECT COUNT(*) as completed FROM student_lesson sl
             JOIN lesson l ON sl.lesson_id = l.lesson_id
             WHERE sl.student_id = ? AND l.course_id = ? AND sl.status = "Hoàn thành"`,
            [studentId, courseId]
        );

        // Tính tỷ lệ phần trăm
        const percentProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
        const courseStatus = percentProgress === 100 ? 'Hoàn thành' : 'Đang học';

        // 3. Cập nhật trực tiếp kết quả mới nhất vào bảng tiến độ khóa học student_course
        const query3 = percentProgress === 100
            ? 'UPDATE student_course SET progress = ?, status = ?, completed_at = COALESCE(completed_at, NOW()) WHERE student_id = ? AND course_id = ?'
            : 'UPDATE student_course SET progress = ?, status = ? WHERE student_id = ? AND course_id = ?';

        await db.query(query3, [percentProgress, courseStatus, studentId, courseId]);
    },
    // 6. Lấy tiến độ khóa học
    getCourseProgress: async (studentId, courseId) => {
        // 1. Kiểm tra xem học viên này đã đăng ký khóa học chưa
        const [enrollment] = await db.query(
            'SELECT status FROM student_course WHERE student_id = ? AND course_id = ?',
            [studentId, courseId]
        );

        // Nếu chưa đăng ký thì trả về mặc định
        if (enrollment.length === 0) {
            return { progress: 0, status: 'Chưa học' };
        }

        try {
            // 2. Đếm tổng số bài học hiện có (Bao gồm cả bài mới thêm)
            const [[{ total }]] = await db.query(
                'SELECT COUNT(*) as total FROM lesson WHERE course_id = ? AND status = "Active"',
                [courseId]
            );

            // 3. Đếm số bài học học viên đã "Hoàn thành"
            const [[{ completed }]] = await db.query(
                `SELECT COUNT(*) as completed FROM student_lesson sl
                 JOIN lesson l ON sl.lesson_id = l.lesson_id
                 WHERE sl.student_id = ? AND l.course_id = ? AND sl.status = "Hoàn thành"`,
                [studentId, courseId]
            );

            // 4. Tính toán lại tỷ lệ phần trăm thực tế ngay tại thời điểm gọi API
            const percentProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
            const courseStatus = percentProgress === 100 ? 'Hoàn thành' : 'Đang học';

            // 5. Cập nhật ngược lại vào DB để đồng bộ dữ liệu tĩnh (Dành cho việc làm báo cáo sau này)
             const query5 = percentProgress === 100
                ? 'UPDATE student_course SET progress = ?, status = ?, completed_at = COALESCE(completed_at, NOW()) WHERE student_id = ? AND course_id = ?'
                : 'UPDATE student_course SET progress = ?, status = ? WHERE student_id = ? AND course_id = ?';

            await db.query(query5, [percentProgress, courseStatus, studentId, courseId]);

            return { progress: percentProgress, status: courseStatus };

            return { progress: percentProgress, status: courseStatus };

        } catch (error) {
            console.error("Lỗi khi tính toán động tiến độ khóa học:", error);
            return { progress: 0, status: 'Đang học' };
        }
    }
};

module.exports = ProgressModel;
