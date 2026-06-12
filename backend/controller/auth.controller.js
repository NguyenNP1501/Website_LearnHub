const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/auth/user.model");

const buildUserProfile = (user) => {
  const baseProfile = {
    id: Number(user.userId),
    name: user.userName ?? "",
    email: user.email ?? "",
    role: user.role,
  };

  if (user.role === "student") {
    return {
      ...baseProfile,
      profileId: Number(user.studentId),
      school: user.school ?? "",
      gradeClass: user.gradeClass ?? "",
    };
  }

  return {
    ...baseProfile,
    profileId: Number(user.teacherId),
    specialization: user.specialization ?? "",
  };
};

const buildTokenPayload = (profile) => ({
  userId: profile.id,
  role: profile.role,
  profileId: profile.profileId,
  name: profile.name,
  email: profile.email,
});

const getExpectedProfileId = (user) => {
  if (user.role === "student") {
    return user.studentId;
  }

  return user.teacherId;
};

exports.login = async (req, res, next) => {
  try {
    const email = String(req.body?.email ?? "").trim();
    const password = String(req.body?.password ?? "");
    const requestedRole = String(req.body?.role ?? "").trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userModel.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password ?? "");

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (requestedRole && requestedRole !== user.role) {
      return res.status(403).json({
        success: false,
        message: "This account does not match the selected role",
      });
    }

    const profileId = getExpectedProfileId(user);

    if (!profileId) {
      return res.status(409).json({
        success: false,
        message: "Account profile is incomplete",
      });
    }

    const profile = buildUserProfile(user);
    const token = jwt.sign(
      buildTokenPayload(profile),
      process.env.JWT_SECRET || "remake-2-dev-secret",
      { expiresIn: "7d" },
    );

    return res.json({
      success: true,
      data: {
        token,
        user: profile,
      },
    });
  } catch (error) {
    return next(error);
  }
};
exports.register = async (req, res) => {
  try {
    const { full_name, email, password, role, school, class_name, major } = req.body;

    // 1. Kiểm tra trùng Email (Đổi tên thành existingUser vì trả về 1 đối tượng)
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Email này đã được sử dụng!" 
      });
    }

    // 2. MÃ HÓA MẬT KHẨU BẰNG BCRYPT
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. CHUẨN HÓA ROLE
    let normalizedRole = String(role ?? "").trim().toLowerCase();
    if (normalizedRole === 'giáo viên' || normalizedRole === 'teacher') {
      normalizedRole = 'admin';
    } else if (normalizedRole === 'học sinh' || normalizedRole === 'student') {
      normalizedRole = 'student';
    } else if (normalizedRole === 'quản trị viên' || normalizedRole === 'admin') {
      normalizedRole = 'admin';
    }

    // 4. Gọi Model lưu thông tin
    await userModel.createUser({
      userName: full_name,
      email: email,
      password: hashedPassword, 
      role: normalizedRole, 
      school: school || null,
      gradeClass: class_name || null,
      specialization: major || null
    });

    // ĐÃ SỬA: Trả về success: true để đồng bộ cấu trúc phản hồi API của toàn bộ file
    return res.status(201).json({ 
      success: true, 
      message: "Đăng ký tài khoản thành công!" 
    });

  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Lỗi Server!" 
    });
  }
};
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await userModel.findByEmail(req.auth.email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: {
        user: buildUserProfile(user),
      },
    });
  } catch (error) {
    return next(error);
  }
};
