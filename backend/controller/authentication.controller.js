const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("../configs/database.config");
const Token = require("../models/Token");
const User = require("../models/User");
const mailService = require("../services/mailService");

const RESET_TOKEN_TTL_MS = 3 * 60 * 1000;

const hashToken = (token) =>
  crypto.createHash("sha256").update(String(token)).digest("hex");

const getFrontendBaseUrl = () =>
  process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173";

exports.handleToken = async (req, res) => {
  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email exists, a reset link has been sent.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    const resetLink = `${getFrontendBaseUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`;

    await Token.create(user.email, hashedToken, expiresAt, false, user.userId);
    await mailService.sendResetPasswordEmail(user.email, resetLink);

    return res.status(200).json({
      success: true,
      message: "Reset link sent successfully.",
    });
  } catch (error) {
    console.error("Error creating reset token:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create reset token.",
    });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const token = String(req.query?.token ?? "").trim();

    if (!token) {
      return res.status(200).json({ valid: false });
    }

    const tokenRecord = await Token.getToken(hashToken(token));
    return res.status(200).json({ valid: Boolean(tokenRecord) });
  } catch (error) {
    console.error("Error verifying reset token:", error);
    return res.status(500).json({
      valid: false,
      message: "Failed to verify reset token.",
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const username = String(req.body?.username ?? "").trim();
    const token = String(req.body?.token ?? "").trim();
    const newPassword = String(req.body?.newPassword ?? "");

    if (!username || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Username, token, and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    const hashedToken = hashToken(token);
    const tokenRecord = await Token.getToken(hashedToken);

    if (!tokenRecord) {
      return res.status(400).json({
        success: false,
        message: "Reset token is invalid or has expired.",
      });
    }

    const user = await User.findByEmail(tokenRecord.email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.userName !== username) {
      return res.status(400).json({
        success: false,
        message: "Username does not match the reset link.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [result] = await db.query(
      "UPDATE user SET password = ? WHERE user_id = ?",
      [hashedPassword, user.userId],
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Failed to update password.",
      });
    }

    await Token.deleteToken(hashedToken);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change password.",
    });
  }
};
