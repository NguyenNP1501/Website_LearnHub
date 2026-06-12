const gradeModel = require('../../models/KhoaHoc/GradeModel');

const clientGradeController = {
  // API: Lấy danh sách khối lớp công khai cho học sinh chọn
  getAllGrades: async (req, res) => {
    try {
      const grades = await gradeModel.getAllGrades();
      return res.json({ 
        success: true, 
        data: grades 
      });
    } catch (error) {
      console.error("Lỗi lấy khối lớp bên client:", error);
      return res.status(500).json({ success: false, message: "Lỗi kết nối CSDL!" });
    }
  }
};

module.exports = clientGradeController;