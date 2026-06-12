// File: backend/controllers/KhoaHoc/adminLessonController.js
const LessonModel = require('../../models/KhoaHoc/LessonModel');

const getUrl = (file) => {
    if (!file) return null;
    
    // Chuẩn hóa toàn bộ dấu gạch chéo ngược (Windows) thành gạch chéo xuôi (Web)
    const safePath = file.path.replace(/\\/g, '/');
    
    // Tìm vị trí chữ 'uploads/' để cắt chuỗi linh hoạt, không phụ thuộc vào dấu gạch chéo đầu
    const targetKeyword = 'uploads/';
    const keywordIndex = safePath.indexOf(targetKeyword);
    
    if (keywordIndex !== -1) {
        // Cắt lấy phần đường dẫn nằm sau thư mục 'uploads/'
        const relativePath = safePath.substring(keywordIndex + targetKeyword.length);
        return `http://localhost:3000/uploads/${relativePath}`;
    }
    
    // Phương án dự phòng nếu không tìm thấy thư mục uploads
    return `http://localhost:3000/${safePath}`;
};

const adminLessonController = {
    //API 1: LẤY CHI TIẾT BÀI GIẢNG
    getLessonDetail: async (req, res) => {
        try {
            const { id } = req.params;
            const rows = await LessonModel.findById(id);

            if (!rows || rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Bài giảng không tồn tại trên hệ thống!"
                });
            }

            return res.status(200).json({
                success: true,
                data: rows[0]
            });
        } catch (error) {
            console.error("Lỗi lấy chi tiết bài giảng phía Admin:", error);
            return res.status(500).json({ success: false, message: "Lỗi Server!" });
        }
    },

    //API 2: TẠO BÀI GIẢNG MỚI (VÁ TRIỆT ĐỂ LỖI NULL)
    createLesson: async (req, res) => {
        try {
            // Chấp nhận cả cơ chế viết camelCase hoặc snake_case từ Frontend gửi lên
            const { title, chapter, content, status } = req.body;
            const course_id_raw = req.body.course_id || req.body.courseId;

            let thumbnailFile = null;
            let videoFile = null;

            if (req.files) {
                if (Array.isArray(req.files)) {
                    // Xử lý nếu route đang dùng upload.any()
                    thumbnailFile = req.files.find(f => f.fieldname === 'thumbnailFile' || f.fieldname === 'thumbnail');
                    videoFile = req.files.find(f => f.fieldname === 'videoFile' || f.fieldname === 'video');
                } else {
                    // Xử lý nếu route đang dùng upload.fields()
                    thumbnailFile = req.files?.thumbnailFile?.[0] || req.files?.thumbnail?.[0];
                    videoFile = req.files?.videoFile?.[0] || req.files?.video?.[0];
                }
            }

            // Tiến hành build URL sạch từ tệp tin tìm được
            const thumbnail_url = getUrl(thumbnailFile);
            const video_url = getUrl(videoFile);

            // Đẩy dữ liệu sang Model khớp 100% tên biến bóc tách { thumbnail_url, video_url }
            const newLessonId = await LessonModel.create({
                course_id: Number(course_id_raw),
                title,
                chapter,
                content,
                thumbnail_url, 
                video_url,     
                status: status || 'Active'
            });

            return res.status(201).json({
                success: true,
                message: "Tạo bài giảng mới thành công!",
                lessonId: newLessonId
            });
        } catch (error) {
            console.error("Lỗi khi tạo bài giảng:", error);
            return res.status(500).json({ success: false, message: "Lỗi Server khi tạo bài giảng!" });
        }
    },

    //API 3: CẬP NHẬT BÀI GIẢNG
    updateLesson: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, chapter, content, status } = req.body;
            const course_id_raw = req.body.course_id || req.body.courseId;

            // 1. Tìm bản ghi hiện tại trong database để lấy lại URL cũ phòng hờ
            const rows = await LessonModel.findById(id);
            if (!rows || rows.length === 0) {
                return res.status(404).json({ success: false, message: "Bài giảng không tồn tại!" });
            }
            const currentLesson = rows[0];

            let thumbnailFile = null;
            let videoFile = null;

            // 2. Ép kiểu đọc tệp tin linh hoạt theo cấu trúc mảng hoặc thực thể đối tượng
            if (req.files) {
                if (Array.isArray(req.files)) {
                    thumbnailFile = req.files.find(f => f.fieldname === 'thumbnailFile' || f.fieldname === 'thumbnail');
                    videoFile = req.files.find(f => f.fieldname === 'videoFile' || f.fieldname === 'video');
                } else {
                    thumbnailFile = req.files?.thumbnailFile?.[0] || req.files?.thumbnail?.[0];
                    videoFile = req.files?.videoFile?.[0] || req.files?.video?.[0];
                }
            }

            // 3.CƠ CHẾ PHÒNG VỆ: Nếu tải lên file mới -> Dùng URL mới. Không tải lên -> Giữ nguyên URL cũ trong DB
            const thumbnail_url = thumbnailFile ? getUrl(thumbnailFile) : currentLesson.img_url;
            const video_url = videoFile ? getUrl(videoFile) : currentLesson.video_url;

            // 4. Đồng bộ truyền dữ liệu sang cho LessonModel xử lý câu lệnh điều hướng UPDATE
            await LessonModel.update(id, {
                course_id: Number(course_id_raw || currentLesson.course_id),
                title,
                chapter,
                content,
                thumbnail_url, 
                video_url,     
                status
            });

            return res.status(200).json({
                success: true,
                message: "Cập nhật thông tin bài giảng thành công!"
            });

        } catch (error) {
            console.error("Lỗi khi cập nhật bài giảng:", error);
            return res.status(500).json({ success: false, message: "Lỗi Server không thể chỉnh sửa bài giảng!" });
        }
    },

    //API 4: XÓA BÀI GIẢNG KHỎI HỆ THỐNG
    deleteLesson: async (req, res) => {
        try {
            const { id } = req.params;
            const rows = await LessonModel.findById(id);
            if (!rows || rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Bài giảng không tồn tại hoặc đã bị xóa trước đó!"
                });
            }

            await LessonModel.delete(id);
            return res.status(200).json({
                success: true,
                message: "Xóa bài giảng thành công hoàn toàn!"
            });
        } catch (error) {
            console.error("Lỗi khi xóa bài giảng phía Admin:", error);
            return res.status(500).json({ success: false, message: "Lỗi Server khi xóa bài giảng!" });
        }
    }
};

module.exports = adminLessonController;