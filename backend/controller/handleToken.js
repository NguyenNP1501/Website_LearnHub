const Token = require('../models/Token');
const User = require('../models/User');
const crypto = require('crypto');
const mailService = require('../services/mailService');

exports.handleToken = async (req, res) => {
    try{
        const { email } = req.body;
        const user_id = await User.getUserIdByEmail(email);
        const token = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const expires_at = new Date(Date.now() + 3 * 60 * 1000); // Token expires in 3 minutes
        const is_used = false;
        // Lưu token đã mã hóa vào cơ sở dữ liệu
        await Token.create(email, hashedToken, expires_at, is_used, user_id);

        // Gửi bản chưa mã hóa của token về email của người dùng
        const resetLink = `http://localhost:3000/api/authentication/reset-password?token=${token}`;
        await mailService.sendResetPasswordEmail(email, resetLink);
        res.status(200).json({ message: 'Token created and email sent successfully' });
    } catch (error) {
        console.error('Error creating token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}