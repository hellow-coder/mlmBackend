const {LEVEL_COMMISSIONS} = require("../config/commissionRate")
const User  = require("../models/user.Model")





// async function distributeReferralCommission(investorId, amount) {
//   try {
//     let currentUser = await User.findById(investorId).select("sponsorId");
//     if (!currentUser) return;

//     for (let level = 0; level < LEVEL_COMMISSIONS.length; level++) {
//       // ensure sponsor exists
//       if (!currentUser?.sponsorId) break;

//       const sponsor = await User.findById(currentUser.sponsorId).select(
//         "totalEarnings levelIncome directReferralAmount status loginBlocked"
//       );

//       if (!sponsor) break;

//       // 👇 eligibility constraint (IMPORTANT FOR REAL SYSTEM)
//       if (sponsor.loginBlocked || sponsor.status === false) {
//         console.log(`Sponsor ${sponsor.username} is not eligible.`);
//         currentUser = sponsor; // still move up the chain
//         continue;
//       }

//       const commission = (amount * LEVEL_COMMISSIONS[level]) / 100;

//       // 🔹 Separate direct level earnings (L1 only)
//       if (level === 0) {
//         sponsor.directReferralAmount =
//           (sponsor.directReferralAmount || 0) + commission;
//       }

//       sponsor.totalEarnings = (sponsor.totalEarnings || 0) + commission;
//       sponsor.levelIncome = (sponsor.levelIncome || 0) + commission;
      
//       await sponsor.save();

//       console.log(
//         `Level ${level + 1} → ${sponsor.username} earned ₹${commission}`
//       );

//       currentUser = sponsor; // move up to next upline
//     }
//   } catch (error) {
//     console.error("Referral Distribution Error:", error);
//   }
// }


async function distributeReferralCommission(investorId, amount) {
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
          ...(level === 0 && { directReferralAmount: commission }),
        },
      }
    );

    console.log(
      `Level ${level + 1}: ${sponsor.username} earned ₹${commission}`
    );

    currentUser = sponsor;
  }
}


module.exports = { distributeReferralCommission };