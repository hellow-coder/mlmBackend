const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminModel  = require("../models/admin.Model");


module.exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if admin already exists
    const existingAdmin = await AdminModel.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "Admin already exists" });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await AdminModel.create({
      name,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    console.error("Admin Register Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


module.exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const admin = await AdminModel.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // 🎫 Create Token
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

