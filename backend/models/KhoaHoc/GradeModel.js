const db = require('../../configs/database.config');

const gradeModel = {
    // 1. LẤY TOÀN BỘ DANH SÁCH KHỐI LỚP
    getAllGrades: async () => {

        const queryStr = `
            SELECT * FROM grade 
            ORDER BY CAST(REGEXP_REPLACE(grade_name, '[^0-9]', '') AS UNSIGNED) ASC
        `;
        const [rows] = await db.query(queryStr);
        return rows;
    },

    // 2. LẤY CHI TIẾT 1 KHỐI LỚP THEO ID
    getGradeById: async (gradeId) => {
        const [rows] = await db.query('SELECT * FROM grade WHERE grade_id = ?', [gradeId]);
        return rows[0] || null;
    },

    // 3. THÊM KHỐI LỚP MỚI 
    createGrade: async (gradeName) => {
        const [result] = await db.query('INSERT INTO grade (grade_name) VALUES (?)', [gradeName]);
        return result.insertId;
    },

    // 4. CẬP NHẬT TÊN KHỐI LỚP
    updateGrade: async (gradeId, gradeName) => {
        const [result] = await db.query('UPDATE grade SET grade_name = ? WHERE grade_id = ?', [gradeName, gradeId]);
        return result;
    },

    // 5. XÓA KHỐI LỚP
    deleteGrade: async (gradeId) => {
        const [result] = await db.query('DELETE FROM grade WHERE grade_id = ?', [gradeId]);
        return result;
    }
};

module.exports = gradeModel;