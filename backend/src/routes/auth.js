const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth"); // Import the middleware

// Register (for development/testing)
router.post("/register", authController.register);

// Login - provides access token and refresh token
router.post("/login", authController.login);

// Logout - clears session (if using sessions)
router.post("/logout", authController.logout);

// Get current session user (requires JWT token)
router.get("/me", authMiddleware(), authController.getMe);

// Refresh access token using the refresh token (requires refresh token in body)
router.post("/refresh", authController.refreshToken);

module.exports = router;
