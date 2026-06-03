const nodeMailer = require('nodemailer');

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const mailService = {
    sendResetPasswordEmail: async (toEmail, resetLink) => {
        const mailOptions = {
            from: `Đôi ngũ phát triển LearnHub <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Yêu cầu đặt lại mật khẩu',
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eeeeee; border-radius: 8px;">
                    <h2 style="color: #4CAF50; text-align: center;">Yêu cầu đặt lại mật khẩu</h2>
                    <p>Chào bạn,</p>
                    <p>Hệ thống nhận được yêu cầu thiết lập lại mật khẩu từ tài khoản của bạn trên nền tảng LearnHub.</p>
                    <p>Vui lòng bấm vào nút hành động bên dưới để tiến hành đổi mật khẩu mới. <strong>Liên kết này có giá trị trong vòng 3 phút</strong>:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                            Đặt lại mật khẩu mới
                        </a>
                    </div>
                    
                    <p style="color: #555555; font-size: 13px;">Nếu nút bấm phía trên không hoạt động, bạn có thể sao chép đường link này và dán trực tiếp vào thanh địa chỉ của trình duyệt:</p>
                    <p style="color: #0066cc; font-size: 13px; word-break: break-all;">${resetLink}</p>
                    
                    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999999; text-align: center;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này. Tài khoản của bạn vẫn được an toàn.</p>
                </div>`
        };

        // Gửi email
        try {
            await transporter.sendMail(mailOptions);
        }
        catch (error) {
            console.error('Lỗi khi gửi email:', error);
            throw error;
        }
    }
}

module.exports = mailService;