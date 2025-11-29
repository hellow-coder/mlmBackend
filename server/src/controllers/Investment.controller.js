const investmentModel = require("../models/Investment.model")
const { distributeReferralCommission } = require("../services/referralService")
const User = require("../models/user.Model");
const directReferralIncomeModel = require("../models/directReferralIncome.model");
const levelIncomeModel = require("../models/LevelIncomeHistory.model")
const mongoose = require("mongoose");
const RoiHistory = require("../models/RoiHistory.model");

module.exports.createInvestment = async (req, res) => {
  try {
    const { amount } = req.body;
    console.log(req.user,"ddfdd")
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    if (!amount || isNaN(amount) || amount < 100) {
      return res.status(400).json({ message: "Minimum investment is ₹100" });
    }

    let planType, dailyRate, totalDays;
    if (amount >= 1000) {
      planType = "HIGH";
      dailyRate = 2; // 2%
      totalDays = 200;
    } else {
      planType = "LOW";
      dailyRate = 1.5; // 1.5%
      totalDays = 200;
    }

    const investment = await investmentModel.create({
      userId,
      amount,
      planType,
      dailyRate,
      totalDays,
      refCommissionDistributed: false,
    });




     if (!investment.refCommissionDistributed) {
      const user = await User.findById(userId).lean();
      const parentId = user?.parentId;
let referralBonus
      if (parentId) {
         referralBonus = Math.floor(amount * 0.03 * 100) / 100; // 3%

        await User.findByIdAndUpdate(parentId, {
          $inc: {
            directReferralAmount: referralBonus,
           
          },
        });
      }

      
        await directReferralIncomeModel.create({
          userId: parentId,
          fromUserId: userId,
          investmentId: investment._id,
          amount: referralBonus,
          percentage: 3,
          level: 1,
        });


      await investment.save();
    }
 
    // 🛡 Ensure Commission is distributed only ONCE
    if (!investment.refCommissionDistributed) {
      await distributeReferralCommission(userId, amount,investment._id);
      investment.refCommissionDistributed = true;
      await investment.save();
    }

    await User.findByIdAndUpdate(userId, {
  $inc: { totalInvestment: amount }
});

    return res.status(201).json({
      success: true,
      message: "Investment successful and referral distribution completed.",
      investment,
    });

  } catch (error) {
    console.error("Investment Error:", error);
    return res.status(500).json({ message: "Internal Server Error" },error);
  }
};

module.exports.investmentHistory = async (req, res) => {
  try {
    const userId = req.user?._id; // logged-in user

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    
    const investments = await investmentModel.find({ userId }).select(
      "_id amount planType dailyRate totalDays daysCompleted status startDate createdAt"
    ).sort({ createdAt: -1 }); // Latest first

    return res.status(200).json({
      success: true,
      message: "Investment history fetched successfully",
      count: investments.length,
      data: investments,
    });

  } catch (error) {
    console.error("InvestmentHistory Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


module.exports.levelIncomeHistory = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const history = await levelIncomeModel
      .find({ userId }) // 👈 Correct query (not findById)
      .populate("fromUserId", "username email phone") // kis user ne income generate ki
      .populate("investmentId", "amount planType createdAt") // kis investment se mila
      .sort({ createdAt: -1 }); // latest first

    return res.status(200).json({
      success: true,
      count: history.length,
      history,
    });

  } catch (error) {
    console.error("Level Income History Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



module.exports.roiHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    let { investmentId } = req.params;

    console.log("Raw Investment ID from params:", investmentId);
    console.log("Type:", typeof investmentId);

    // Build query
    const query = { userId };

    if (investmentId && 
        investmentId !== 'null' && 
        investmentId !== 'undefined' && 
        investmentId.trim() !== '') {
      
     
      if (!mongoose.Types.ObjectId.isValid(investmentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid investment ID format"
        });
      }
      
     
      query.investmentId = investmentId;
      console.log("✅ Valid Investment ID added to query");
    } else {
      console.log("ℹ️ No valid Investment ID - fetching all history");
    }

    console.log("Final Query:", query);

   
    const history = await RoiHistory.find(query)
      .populate("investmentId", "planName amount totalDays dailyRate status")
      .sort({ distributionDate: -1 });

    console.log("Records found:", history.length);

    res.json({
      success: true,
      count: history.length,
      filter: (investmentId && investmentId !== 'null' && investmentId !== 'undefined') ? "specific" : "all",
      investmentId: (investmentId && investmentId !== 'null' && investmentId !== 'undefined') ? investmentId : null,
      data: history,
    });

  } catch (error) {
    console.error("❌ Error in roiHistory:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching ROI history",
      error: error.message,
    });
  }
};