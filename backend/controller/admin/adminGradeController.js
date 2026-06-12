const gradeModel = require('../../models/KhoaHoc/GradeModel'); // Hãy giữ nguyên đường dẫn cũ của bạn

const adminGradeController = {
  // 1. LẤY TOÀN BỘ DANH SÁCH KHỐI LỚP
  getAllGrades: async (req, res) => {
    try {
      const grades = await gradeModel.getAllGrades();
      return res.json({ 
        success: true, 
        data: grades 
      });
    } catch (error) {
      console.error("Lỗi lấy khối lớp bên admin:", error);
      return res.status(500).json({ success: false, message: "Lỗi kết nối CSDL!" });
    }
  },

  // 2. CHỨC NĂNG TẠO THÊM KHỐI LỚP MỚI
  addGrade: async (req, res) => {
    try {
      const { grade_name } = req.body;
      if (!grade_name || !grade_name.trim()) {
        return res.status(400).json({ success: false, message: "Tên khối lớp không được để trống!" });
      }

      const newGradeId = await gradeModel.createGrade(grade_name.trim());
      return res.status(201).json({ 
        success: true, 
        message: "Thêm khối lớp mới thành công!",
        id: newGradeId 
      });
    } catch (error) {
      console.error("Lỗi thêm khối lớp bên admin:", error);
      return res.status(500).json({ success: false, message: "Không thể thêm khối lớp!" });
    }
  },

  // 3. CHỨC NĂNG CẬP NHẬT
  updateGrade: async (req, res) => {
    try {
      const { gradeId } = req.params; // Lấy ID lớp từ đường dẫn /:gradeId
      const { grade_name } = req.body; // Lấy tên lớp mới từ body truyền lên

      if (!grade_name || !grade_name.trim()) {
        return res.status(400).json({ success: false, message: "Tên khối lớp mới không được để trống!" });
      }

      const result = await gradeModel.updateGrade(gradeId, grade_name.trim());
      
      // Kiểm tra xem hàng dữ liệu trong MySQL có thực sự thay đổi không
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Không tìm thấy khối lớp yêu cầu hoặc dữ liệu không thay đổi!" });
      }

      return res.json({
        success: true,
        message: "Cập nhật tên khối lớp thành công!"
      });
    } catch (error) {
      console.error("Lỗi sửa khối lớp bên admin:", error);
      return res.status(500).json({ success: false, message: "Không thể cập nhật tên khối lớp!" });
    }
  }
};

module.exports = adminGradeController;