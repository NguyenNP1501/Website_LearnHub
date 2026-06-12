const db = require('../../configs/database.config');

const SubjectModel = {
    //1.LẤY TOÀN BỘ DANH SÁCH MÔN HỌC
    getAllSubjects: async () => {
        const [rows] = await db.query('SELECT * FROM subject ORDER BY subject_id ASC');
        return rows;
    },

    //2. LẤY CHI TIẾT 1 MÔN HỌC THEO ID
    getSubjectById: async (subjectId) => {
        const [rows] = await db.query('SELECT * FROM subject WHERE subject_id = ?', [subjectId]);
        return rows[0] || null;
    },

    //3.THÊM MÔN HỌC MỚI (Admin)
    createSubject: async (subjectName) => {
        const [result] = await db.query('INSERT INTO subject (subject_name) VALUES (?)', [subjectName]);
        return result.insertId; // Trả về ID tự động tăng của môn học vừa tạo
    },

    //4.CẬP NHẬT TÊN MÔN HỌC (Admin)
    updateSubject: async (subjectId, subjectName) => {
        const [result] = await db.query('UPDATE subject SET subject_name = ? WHERE subject_id = ?', [subjectName, subjectId]);
        return result;
    },

    //5.XÓA MÔN HỌC (Admin)
    deleteSubject: async (subjectId) => {
        const [result] = await db.query('DELETE FROM subject WHERE subject_id = ?', [subjectId]);
        return result;
    }
};

module.exports = SubjectModel;