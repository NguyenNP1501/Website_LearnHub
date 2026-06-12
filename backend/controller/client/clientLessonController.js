const LessonModel = require('../../models/KhoaHoc/LessonModel');
const ProgressModel = require('../../models/KhoaHoc/ProgressModel');

const clientLessonController = {
    //API 1: LẤY CHI TIẾT BÀI HỌC VÀ TIẾN ĐỘ CŨ
    getLessonDetail: async (req, res) => {
        try {
            const lessonId = req.params.id;
            const rows = await LessonModel.findById(lessonId);

            if (!rows || rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy bài giảng này trên hệ thống!"
                });
            }

            const lesson = rows[0];

            //Học viên không được phép truy cập các bài giảng đang tạm ẩn
            if (lesson.status === 'Inactive') {
                return res.status(403).json({
                    success: false,
                    message: "Bài giảng này hiện đang tạm ẩn, bạn không có quyền truy cập!"
                });
            }

            const studentId =req.auth?.id || req.auth?.user_id || req.auth?.userId;
            const progressData = await ProgressModel.getLessonProgress(studentId, lessonId);
            const navigation = await LessonModel.findNextAndPrev(lesson.course_id, lessonId);

            return res.status(200).json({
                success: true,
                ...lesson,
                watch_time: progressData ? progressData.watch_time : 0,
                prev_lesson_id: navigation ? navigation.prev_lesson_id : null,
                next_lesson_id: navigation ? navigation.next_lesson_id : null
            });
        } catch (error) {
            console.error("Lỗi lấy bài giảng phía Client:", error);
            return res.status(500).json({
                success: false,
                message: "Lỗi hệ thống khi tải nội dung bài học!"
            });
        }
    },

    //API 2: LƯU TIẾN ĐỘ XEM VIDEO
    saveVideoProgress: async (req, res) => {
        try {
            const lessonId = req.params.id;
            const { watch_time, duration } = req.body;
            const studentId = req.auth?.id || req.auth?.user_id || req.auth?.userId;

            // BỔ SUNG CHECK ACTIVE: Tìm thông tin bài học trước khi xử lý lưu tiến độ
            const lessonRows = await LessonModel.findById(lessonId);
            if (!lessonRows || lessonRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy bài giảng để lưu tiến độ!"
                });
            }

            const lesson = lessonRows[0];

            // Nếu bài giảng đã bị đưa vào trạng thái Inactive, chặn không cho lưu tiến độ
            if (lesson.status === 'Inactive') {
                return res.status(403).json({
                    success: false,
                    message: "Bài giảng này đã tạm ẩn, không thể đồng bộ tiến độ học tập!"
                });
            }

            // Gọi hàm UPSERT xử lý cập nhật dữ liệu tiến độ bài học đơn lẻ
            await ProgressModel.updateLessonProgress(studentId, lessonId, watch_time, duration);

            const courseId = lesson.course_id;
            if (courseId) {
                await ProgressModel.calculateAndUpdateCourseProgress(studentId, courseId);
            }

            return res.status(200).json({
                success: true,
                message: "Đã đồng bộ và lưu lại tiến độ học tập thành công!"
            });
        } catch (error) {
            console.error("Lỗi lưu tiến độ bài học phía Client:", error);
            return res.status(500).json({
                success: false,
                message: "Hệ thống bận, không thể lưu lại tiến độ video!"
            });
        }
    }
};

module.exports = clientLessonController;