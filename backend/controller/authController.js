const Token = require('../models/Token');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const authController = {
    // Kiểm tra token của người dùng có hợp lệ hay không
    verifyToken: async (req, res) => {
        try {
            const { token } = req.query;
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
            const tokenData = await Token.getToken(hashedToken);

            if (!tokenData) {
                return res.status(400).json({ valid: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
            }
            res.status(200).json({ valid: true, message: 'Token hợp lệ' });
        }
        catch (err) {
            console.error("Error verifying token: " + err);
            res.status(500).json({ valid: false, message: 'Lỗi máy chủ' });
        }
    },

    // Thực hiện đổi mật khẩu cho người dùng sau khi xác thực token thành công
    changePassword: async (req, res) => {
        try {
            const { username, token, newPassword } = req.body;
            if (!username || !token || !newPassword) {
                return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
            }

            // Cập nhật mật khẩu mới cho người dùng
            await User.updatePassword(username, await bcrypt.hash(newPassword, 10));

            // Xóa token đã sử dụng
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
            await Token.deleteToken(hashedToken);

            res.status(200).json({ message: 'Mật khẩu đã được đổi thành công' });
        }
        catch (err) {
            console.error("Error changing password: " + err);
            res.status(500).json({ message: 'Lỗi máy chủ' });
        }
    }
}

module.exports = authController;