const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.Model");



module.exports.isUserLogedIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    // console.log(token)
    // 🔹 Decode token (get user id from token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔹 Find actual user from DB
    const user = await UserModel.findById(decoded.id).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // 🔹 Attach user to request for controller access
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized or invalid token" });
  }
};



module.exports.isAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No token?
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = decoded;

    // Check if user exists and is admin
    const user = await User.findById(req.user._id).select("role name email");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied: Admin only" });
    }

    next(); // 🔥 User is admin → allow access

  } catch (error) {
    console.error("Admin Auth Error:", error);
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};
