const express = require("express");
const authController = require("../controller/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/login", authController.login);
router.get("/me", requireAuth(), authController.getCurrentUser);

module.exports = router;
