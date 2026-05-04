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
