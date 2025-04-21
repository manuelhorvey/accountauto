// authController.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const SECRET = process.env.JWT_SECRET || "supersecretkey";

const register = async (req, res) => {
  const { username, password, role } = req.body;

  // Check if all required fields are provided
  if (!username || !password || !role) {
    return res.status(400).json({ msg: "Please provide username, password, and role." });
  }

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ msg: "Username already taken" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user object
    const newUser = new User({ username, password: hashedPassword, role });

    // Save the new user to the database
    await newUser.save();

    // Respond with a success message
    res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    // Catch any other errors (database, etc.)
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Login
const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const accessToken = jwt.sign({ userId: user._id, role: user.role, username: user.username }, SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ userId: user._id, role: user.role, username: user.username }, SECRET, { expiresIn: "7d" });

    res.json({
      msg: "Login successful",
      accessToken,
      refreshToken,
      user,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};


// Logout - JWT-based logout (no session handling)
const logout = (req, res) => {
  res.status(200).json({ msg: "Logged out successfully" });
};

// Get current user - Validate JWT token
const getMe = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];  // Get token from Authorization header

  if (!token) {
    return res.status(401).json({ msg: 'Not authenticated' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, SECRET);

    // Return user data if valid
    res.status(200).json({
      id: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    });
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid or expired token.' });
  }
};

// Refresh token
const refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ msg: "Refresh token is required" });

  try {
    const decoded = jwt.verify(refreshToken, SECRET);
    const newAccessToken = jwt.sign({ userId: decoded.userId, role: decoded.role, username: decoded.username }, SECRET, { expiresIn: "1h" });
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ msg: "Invalid or expired refresh token" });
  }
};

// Export the functions correctly
module.exports = { register, login, logout, getMe, refreshToken };
