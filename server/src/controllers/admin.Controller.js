const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminModel  = require("../models/admin.Model");
const UserModel = require("../models/user.Model")
const TopupHistory = require("../models/TopupHistory")
const { v4: uuidv4 } = require("uuid");
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

module.exports.getAllUsers = async (req, res) => {
  try{
    const users = await UserModel.find().select("-passwordHash");
    return res.status(200).json({success:true, users});
  }catch(error){
    console.error("Get All Users Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}



module.exports.getUserForTopup = async (req, res) => {
  try {
    const rawUsername = req.body?.userName?.trim();
    if (!rawUsername) {
      return res.status(400).json({ success: false, message: "Username is required" });
    }

    const normalized = rawUsername.toLowerCase();

    const user = await UserModel.findOne({ username: normalized }) 
      .select("username email phone position")
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get User For Topup Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};




module.exports.adminTopup = async (req, res) => {
  try {
    const { username, amount } = req.body;

    if (!username || !amount) {
      return res.status(400).json({ success: false, message: "Username and amount are required" });
    }

    const normalizedUsername = username.trim().toLowerCase();

    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized: Admin access required" });
    }

    const amountValue = Number(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be a valid positive number" });
    }

    // Get previous balance
    const userBefore = await UserModel.findOne({ username: normalizedUsername }).select("mainWallet");
    if (!userBefore) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const previousBalance = userBefore.mainWallet;

    // Update wallet
    const user = await UserModel.findOneAndUpdate(
      { username: normalizedUsername },
      { $inc: { mainWallet: amountValue } },
      { new: true }
    );

    // Save history
    await TopupHistory.create({
      userId: user._id,
      username: user.username,
      amount: amountValue,
      previousBalance,
      newBalance: user.mainWallet,
      doneBy:  req.user.name || req.user.email,
      transactionId: uuidv4(),
    });

    return res.status(200).json({
      success: true,
      message: `Topup successful of ${amountValue}`,
      mainWallet: user.mainWallet,
    });

  } catch (error) {
    console.error("Admin Topup Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


module.exports.getTopupHistory = async (req, res) => { {
  try {
    // const history = await TopupHistory.find().sort({ createdAt: -1 });
     const history = await TopupHistory.find()
      .populate("userId", "name email phone")  // ⬅ only populate user details
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, history });
  } catch (error) {
    console.error("Get Topup History Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  } }}

module.exports.blockUser= async (req, res) => {
  try{
    const {userId}= req.params;
    if(!userId){
      return res.status(400).json({success:false, message:"UserId is required"})
    } 
    const user = await UserModel.findById(userId);
    if(!user){
      return res.status(404).json({success:false, message:"User not found"})
    } 
    user.loginBlocked = !user.loginBlocked;
    await user.save();
    return res.status(200).json({success:true, message:`User has been ${user.loginBlocked ? "blocked" : "unblocked"} successfully`})
  }catch(error){
    console.error("Block/Unblock User Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }     
}  
