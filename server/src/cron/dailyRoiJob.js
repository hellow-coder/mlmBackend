const cron = require("node-cron");
const User  = require("../models/user.Model")
const Investment  = require("../models/Investment.model");
const { mongoose } = require("mongoose");



function isSameDay(date1, date2) {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

async function distributeDailyROI() {
  const today = new Date();

  try {
    const investments = await Investment.find({
      status: "ACTIVE",
      daysCompleted: { $lt: mongoose.Types.Decimal128.fromString("200") } 
    });

    for (const inv of investments) {
      // 🚫 Already paid today?
      if (isSameDay(inv.lastPaidDate, today)) continue;

    
       const amount = Number(inv.amount);         // Decimal128 → Number
const rate = Number(inv.dailyRate) / 100;

const dailyROI = amount * rate;  
const creditAmount = Math.floor(dailyROI * 100) / 100;
      console.log(creditAmount)
   await User.findByIdAndUpdate(
  inv.userId,
  {
    $inc: {
      totalEarnings: creditAmount,
      mainWallet: creditAmount,   
    },
  },
  { new: true } 
);

      // 🗂 Update investment progress
      inv.daysCompleted += 1;
      inv.lastPaidDate = today;

      if (inv.daysCompleted >= inv.totalDays) {
        inv.status = "COMPLETED";
      }

      await inv.save();
    }

    console.log("🎯 Daily ROI distribution completed successfully.");

  } catch (error) {
    console.error("❌ Error distributing ROI:", error);
  }
}

module.exports = distributeDailyROI;
