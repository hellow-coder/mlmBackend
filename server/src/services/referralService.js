const {LEVEL_COMMISSIONS} = require("../config/commissionRate")
const User  = require("../models/user.Model")
const levelIncomeModel  = require("../models/LevelIncomeHistory.model")




async function distributeReferralCommission(investorId, amount,investmentId) {
  console.log(investorId,amount)
  let currentUser = await User.findById(investorId).select("sponsorId");

  if (!currentUser) return;

  for (let level = 0; level < LEVEL_COMMISSIONS.length; level++) {
    if (!currentUser?.sponsorId) break;

    const sponsor = await User.findById(currentUser.sponsorId);

    if (!sponsor) break;

    if (sponsor.loginBlocked || sponsor.status === false) {
      currentUser = sponsor;
      continue;
    }

    const commission = (amount * LEVEL_COMMISSIONS[level]) / 100;

    await User.updateOne(
      { _id: sponsor._id },
      {
        $inc: {
          totalEarnings: commission,
          levelIncome: commission,
          
        },
      }
    );


     await levelIncomeModel.create({
      userId: sponsor._id,          // jisko income mili (upline)
      fromUserId: investorId,       // jisne invest kiya (downline)
      investmentId: investmentId,   // kis investment se aayi
      level: level + 1,             // Level (1 to 5)
      percentage:LEVEL_COMMISSIONS[level],      // % commission
      amount: commission,           // final payout
    });

    console.log(
      `Level ${level + 1}: ${sponsor.username} earned ₹${commission}`
    );

    currentUser = sponsor;
  }
}


module.exports = { distributeReferralCommission };