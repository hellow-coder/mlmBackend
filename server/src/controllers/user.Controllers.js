
const { generateReferralCode, generateUsername } = require("../utils/randomGenrate");
const UserModel = require("../models/user.Model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getPlacementPosition } = require("../utils/getPlacementPosition");
const distributeDailyROI = require("../cron/dailyRoiJob");
const DirectReferralModel = require("../models/directReferralIncome.model")



module.exports.userRegister = async (req, res) => {
  // console.log(req.body)
  try {
    const { phone, email, password, sponsorCode } = req.body;

   
    if (!phone || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (await UserModel.findOne({ email })) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }
    if (await UserModel.findOne({ phone })) {
      return res.status(400).json({ success: false, message: "Phone number already used" });
    }

    let sponsorId = null;
    let placementInfo = null;

    const totalUsers = await UserModel.countDocuments();

 
    if (totalUsers > 0) {
      if (!sponsorCode) {
        return res.status(400).json({ success: false, message: "Sponsor Code is required" });
      }

      
      const sponsor = await UserModel.findOne({
        referralCode: sponsorCode.trim().toUpperCase(),
      });

      if (!sponsor) {
        return res.status(400).json({ success: false, message: "Invalid Sponsor Code" });
      }

      sponsorId = sponsor._id; 

   
      placementInfo = await getPlacementPosition(sponsorId);
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

   
    const newUser = await UserModel.create({
      phone,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      sponsorId, 
    });

    newUser.referralCode = await generateReferralCode(newUser._id);
    newUser.username = generateUsername();

    
    if (sponsorId) {
      await UserModel.findByIdAndUpdate(sponsorId, {
        $push: { referredUsers: newUser._id },
      });
    }

 
    if (placementInfo) {
      await UserModel.findByIdAndUpdate(placementInfo.parentId, {
        $set: { [placementInfo.position]: newUser._id },
      });

      newUser.position = placementInfo.position; 
      newUser.parentId = placementInfo.parentId; 
    }

    await newUser.save();

    
 

   
     if (newUser?.parentId) {
      const parent = await UserModel.findById(newUser.parentId).lean();
      newUser.level = parent.level + 1; // next level

      if (newUser.level > 5) {
        newUser.level = 5; // cap at level 5
      }
    } else {
      newUser.level = 1; // first user or root
    }

    await newUser.save();


    return res.status(201).json({
      success: true,
      message: "Registration successful",
      // token,
      user: {
        id: newUser._id,
        phone,
        email,
        username: newUser.username,
        referralCode: newUser.referralCode,
        sponsorId: newUser.sponsorId, // who referred
        parentId: newUser.parentId,   // where placed
        position: newUser.position,   // left/right
      },
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};




module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }


    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // 🚨 Blocked or disabled account
    // if (user.loginBlocked || !user.status) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Your account is inactive or blocked. Please contact support.",
    //   });
    // }

    // ❌ Not email verified yet
    // if (!user.isEmailVerified) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Please verify your email to continue.",
    //   });
    // }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

   
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

 
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        referralCode: user.referralCode,
        sponsorId: user.sponsorId,
        parentId: user.parentId,
        role: user.role,
        position: user.position,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


module.exports.getDirectUser = async (req, res) => {
 
  try {
    
    const id = req.user._id;
    
  //  console.log(id ,"fdfkfd")

    if (!id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await UserModel.findById(id)
      .select("referredUsers").populate({
        path: "referredUsers",
        select: "_id username phone position totalInvestment totalEarnings email referralCode createdAt",
      })
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error in getDirectUser:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// module.exports.getProfile = async (req, res) => {
//   try {
//     const id = req.user._id
//     const { userName } = req.body;

//     if (!userName || typeof userName !== "string") {
//       return res.status(400).json({ success: false, message: "Username required" });
//     }


//     const user = await UserModel.findOne({ username: userName.toLowerCase() })
//       .select("_id username name referralCode email position createdAt"); 

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Profile fetched successfully",
//       data: user,
//     });

//   } catch (error) {
//     console.error("Get Profile Error:", error);
//     return res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };



module.exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?._id;  // 👈 Logged-in user's id from JWT

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized user" });
    }

    const user = await UserModel.findById(userId)
      .select("-passwordHash ");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });

  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



module.exports.directreferralIncomeHistory = async (req, res) => {
  try {
    const userId = req.user._id; // jis user ki history dekhni hai

    const history = await DirectReferralModel.find({ userId })
      .populate("fromUserId", "name email username phone") // jisne invest kiya
      .populate("investmentId", "amount planType createdAt") // jis investment se income mili
      .sort({ createdAt: -1 }); // latest sabse upar

    if (!history || history.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No referral income found.",
        history: [],
      });
    }

    return res.status(200).json({
      success: true,
      historyCount: history.length,
      history,
    });

  } catch (error) {
    console.error("Referral History Error:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};



module.exports.getRoi = async (req,res)=>{
   await distributeDailyROI();
  res.send("ROI processed successfully");
}