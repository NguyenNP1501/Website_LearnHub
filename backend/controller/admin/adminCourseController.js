const CourseModel = require('../../models/KhoaHoc/CourseModel');

// Hàm chuẩn hóa đường dẫn file để lưu vào Database làm link Web
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

const adminCourseController = {
  //1. TẠO KHÓA HỌC MỚI
  createCourse: async (req, res) => {
    try {
      const { course_name, subject_id, grade_id, description, teacher_id } = req.body;

      if (!course_name || !subject_id || !grade_id) {
        return res.status(400).json({ 
          success: false, 
          message: "Vui lòng nhập đầy đủ các thông tin bắt buộc: Tên khóa học, Môn học và Khối lớp!" 
        });
      }

      // Sử dụng hàm getUrl để tạo link ảnh chuẩn chỉ
      const img_url = getUrl(req.file);

      const newCourseId = await CourseModel.create({
        course_name,
        subject_id: Number(subject_id), 
        grade_id: Number(grade_id),     
        description: description || "",
        teacher_id: teacher_id ? Number(teacher_id) : (req.auth?.userId||null),
        img_url
      });

      return res.status(201).json({
        success: true,
        message: "Tạo khóa học thành công!",
        courseId: newCourseId
      });
    } catch (error) {
      console.error("Lỗi khi tạo khóa học tại Controller:", error);
      return res.status(500).json({ success: false, message: "Lỗi kết nối CSDL khi tạo khóa học!" });
    }
  },

  //2. CẬP NHẬT KHÓA HỌC
  updateCourse: async (req, res) => {
    try {
      const courseId = req.params.id;
      const { course_name, subject_id, grade_id, description } = req.body;


      const updateData = {
        course_name,
        subject_id: Number(subject_id),
        grade_id: Number(grade_id),
        description: description || ""
      };

      if (req.file) {
        updateData.img_url = getUrl(req.file);
      }

      await CourseModel.update(courseId, updateData);

      return res.status(200).json({ success: true, message: "Cập nhật khóa học thành công!" });
    } catch (error) {
      console.error("Lỗi khi cập nhật khóa học tại Controller:", error);
      return res.status(500).json({ success: false, message: "Lỗi Server khi cập nhật khóa học!" });
    }
  },

  //3. XÓA KHÓA HỌC
  deleteCourse: async (req, res) => {
    try {
      const courseId = req.params.id;
      await CourseModel.delete(courseId);
      return res.status(200).json({ success: true, message: "Xóa khóa học thành công!" });
    } catch (error) {
      console.error("Lỗi khi xóa khóa học tại Controller:", error);
      return res.status(500).json({ success: false, message: "Lỗi Server khi xóa khóa học!" });
    }
  }
};

module.exports = adminCourseController;