const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "supersecretkey";

module.exports = (roles = []) => {
  // Allow a single role string instead of requiring an array
  if (typeof roles === "string") roles = [roles];

  return (req, res, next) => {
    let user = null;

    // JWT-based authentication (primary for your API)
    if (req.headers?.authorization?.startsWith("Bearer ")) {
      const token = req.headers.authorization.split(" ")[1]; // Extract token
      try {
        const decoded = jwt.verify(token, SECRET); // Decode the token
        user = { id: decoded.userId, role: decoded.role, username: decoded.username }; // Attach user info from JWT
      } catch (err) {
        // Log the error for debugging purposes
        console.error('JWT Verification Error:', err);
        return res.status(401).json({ msg: "Invalid or expired token." });
      }
    }

    // If no user is found (JWT missing or invalid)
    if (!user) {
      return res.status(401).json({ msg: "Not authenticated." });
    }

    // Check if the user's role is authorized for this route
    if (roles.length && !roles.includes(user.role)) {
      return res.status(403).json({ msg: "Forbidden. Insufficient role." });
    }

    // Attach user to the request for downstream use
    req.user = user;
    next();
  };
};
