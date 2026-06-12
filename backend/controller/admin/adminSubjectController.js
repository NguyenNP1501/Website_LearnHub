const subjectModel = require('../../models/KhoaHoc/SubjectModel');

const adminSubjectController = {
  //1. LẤY TOÀN BỘ DANH SÁCH MÔN HỌC
  getAllSubjects: async (req, res) => {
    try {
      const subjects = await subjectModel.getAllSubjects();
      return res.json({ success: true, data: subjects });
    } catch (error) {
      console.error("Lỗi lấy danh sách môn học:", error);
      return res.status(500).json({ success: false, message: "Lỗi kết nối CSDL!" });
    }
  },

  //2. THÊM MÔN HỌC MỚI
  addSubject: async (req, res) => {
    try {
      const { subject_name } = req.body;
      
      // Kiểm tra dữ liệu đầu vào cơ bản
      if (!subject_name || !subject_name.trim()) {
        return res.status(400).json({ success: false, message: "Tên môn học không được để trống!" });
      }

      const newId = await subjectModel.createSubject(subject_name.trim());
      return res.status(201).json({ 
        success: true, 
        message: "Thêm môn học mới thành công!", 
        id: newId 
      });
    } catch (error) {
      console.error("Lỗi thêm môn học:", error);
      return res.status(500).json({ success: false, message: "Không thể thêm môn học vào máy chủ backend!" });
    }
  },

  //3. CẬP NHẬT TÊN MÔN HỌC
  updateSubject: async (req, res) => {
    try {
      const { id } = req.params; // Lấy subject_id truyền từ URL (ví dụ: /api/admin/subjects/:id)
      const { subject_name } = req.body;

      // 1. Kiểm tra dữ liệu đầu vào
      if (!subject_name || !subject_name.trim()) {
        return res.status(400).json({ success: false, message: "Tên môn học sửa đổi không được để trống!" });
      }

      // 2. Kiểm tra môn học có tồn tại trong hệ thống hay không trước khi cập nhật
      const existingSubject = await subjectModel.getSubjectById(id);
      if (!existingSubject) {
        return res.status(404).json({ success: false, message: "Không tìm thấy môn học yêu cầu trên hệ thống!" });
      }

      // 3. Thực hiện cập nhật trong CSDL
      await subjectModel.updateSubject(id, subject_name.trim());
      
      return res.json({ 
        success: true, 
        message: "Cập nhật thông tin tên môn học thành công!" 
      });
    } catch (error) {
      console.error("Lỗi cập nhật tên môn học:", error);
      return res.status(500).json({ success: false, message: "Lỗi hệ thống, không thể cập nhật môn học!" });
    }
  }
  
};

module.exports = adminSubjectController;