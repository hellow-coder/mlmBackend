const investmentModel = require("../models/Investment.model")
const { distributeReferralCommission } = require("../services/referralService")
const User = require("../models/user.Model")




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
      dailyRate = 0.02; // 2%
      totalDays = 200;
    } else {
      planType = "LOW";
      dailyRate = 0.015; // 1.5%
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

    // 🛡 Ensure Commission is distributed only ONCE
    if (!investment.refCommissionDistributed) {
      await distributeReferralCommission(userId, amount);
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
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
