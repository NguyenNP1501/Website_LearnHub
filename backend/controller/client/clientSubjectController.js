const subjectModel = require('../../models/KhoaHoc/SubjectModel');

const clientSubjectController = {
  getAllSubjects: async (req, res) => {
    try {
      const subjects = await subjectModel.getAllSubjects();
      return res.json({ success: true, data: subjects });
    } catch (error) {
      console.error("Lỗi lấy môn học bên client:", error);
      return res.status(500).json({ success: false, message: "Lỗi kết nối CSDL!" });
    }
  }
};

module.exports = clientSubjectController;