const jwt = require("jsonwebtoken");

const getAllowedRoles = (roles) => {
  if (!roles) {
    return [];
  }

  return Array.isArray(roles) ? roles : [roles];
};

const getTokenFromRequest = (req) => {
  const authorization = req.headers.authorization ?? "";

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
};

exports.requireAuth = (roles = []) => {
  const allowedRoles = getAllowedRoles(roles);

  return (req, res, next) => {
    try {
      const token = getTokenFromRequest(req);

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || "remake-2-dev-secret",
      );

      if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource",
        });
      }

      req.auth = payload;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  };
};
