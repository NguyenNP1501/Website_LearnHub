const profileModel = require('../models/ProfileModel');
const bcrypt = require('bcrypt');
const path = require('path');
const profileController = {
    getProfileDetails: async (req, res) => {
        try {
            const userId = req.auth?.userId;

            if (!userId) {
                return res.status(401).json({ success: false, message: "Không tìm thấy token định danh người dùng!" });
            }

            // Thực hiện gọi song song các hàm truy vấn để tối ưu hóa thời gian phản hồi
            const [user, courses, stats, examHistory] = await Promise.all([
                profileModel.getUserStudentInfo(userId),
                profileModel.getEnrolledCourses(userId),
                profileModel.getStudentStats(userId),
                profileModel.getRecentAttempts(userId)
            ]);

            if (!user) {
                return res.status(404).json({ success: false, message: "Người dùng không tồn tại!" });
            }

            return res.json({
                success: true,
                data: { user, courses, stats, examHistory }
            });

        } catch (error) {
            console.error("Lỗi lấy dữ liệu trang cá nhân:", error);
            return res.status(500).json({ success: false, message: "Lỗi kết nối máy chủ hệ thống!" });
        }
    },
    updateProfile : async (req, res) => {
        try {
           const userId = req.auth?.userId;
            const { name, school, grade } = req.body;

            if (!name || name.trim() === "") {
                return res.status(400).json({ success: false, message: "Họ tên không được để trống!" });
            }

            // Gọi hàm số 5 từ Model
            await profileModel.updateProfileInfo(userId, name, school, grade);

            return res.status(200).json({
                success: true,
                message: "Cập nhật thông tin cá nhân thành công!"
            });
        } catch (error) {
            console.error("🔴 Lỗi updateProfile:", error.message);
            return res.status(500).json({ success: false, message: "Lỗi hệ thống khi cập nhật thông tin!" });
        }
    },

    // API Đổi mật khẩu
    changePassword : async (req, res) => {
        try {
            const userId = req.auth?.userId;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ success: false, message: "Vui lòng nhập đủ mật khẩu cũ và mới!" });
            }

            // 1. Gọi hàm số 6 lấy mật khẩu cũ trong DB ra để đối chiếu
            const currentPasswordHash = await profileModel.getUserPassword(userId);
            if (!currentPasswordHash) {
                return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
            }

            // 2. So sánh mật khẩu người dùng nhập vào với mật khẩu hash trong DB
            const isMatch = await bcrypt.compare(currentPassword, currentPasswordHash);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Mật khẩu hiện tại không chính xác!" });
            }

            // 3. Mã hóa mật khẩu mới
            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);

            // 4. Gọi hàm số 7 để lưu mật khẩu mới vào DB
            await profileModel.updatePassword(userId, hashedNewPassword);

            return res.status(200).json({
                success: true,
                message: "Đổi mật khẩu tài khoản thành công!"
            });
        } catch (error) {
            console.error("🔴 Lỗi changePassword:", error.message);
            return res.status(500).json({ success: false, message: "Lỗi hệ thống khi đổi mật khẩu!" });
        }
    },

// Thêm vào profileController
updateAvatar: async (req, res) => {
    try {
        const userId = req.auth?.userId;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Vui lòng chọn ảnh để tải lên!" });
        }

        const avatarUrl = '/uploads/Avatar/' + req.file.filename;
        await profileModel.updateAvatarUrl(userId, avatarUrl);

        return res.status(200).json({
            success: true,
            message: "Cập nhật ảnh đại diện thành công!",
            data: { avatarUrl }
        });
    } catch (error) {
        console.error("Lỗi updateAvatar:", error.message);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống khi cập nhật ảnh!" });
    }
}
};

module.exports = profileController;