  // const cron = require("node-cron");
  // const User  = require("../models/user.Model")
  // const Investment  = require("../models/Investment.model");
  // const { mongoose } = require("mongoose");



  // function isSameDay(date1, date2) {
  //   if (!date1 || !date2) return false;
  //   return (
  //     date1.getFullYear() === date2.getFullYear() &&
  //     date1.getMonth() === date2.getMonth() &&
  //     date1.getDate() === date2.getDate()
  //   );
  // }

  // async function distributeDailyROI() {
  //   const today = new Date();

  //   try {
  //     const investments = await Investment.find({
  //       status: "ACTIVE",
  //       daysCompleted: { $lt: mongoose.Types.Decimal128.fromString("200") } 
  //     });

  //     for (const inv of investments) {
  //       // 🚫 Already paid today?
  //       if (isSameDay(inv.lastPaidDate, today)) continue;

      
  //       const amount = Number(inv.amount);         // Decimal128 → Number
  // const rate = Number(inv.dailyRate) / 100;

  // const dailyROI = amount * rate;  
  // const creditAmount = Math.floor(dailyROI * 100) / 100;
  //       console.log(creditAmount)
  //   await User.findByIdAndUpdate(
  //   inv.userId,
  //   {
  //     $inc: {
  //       totalEarnings: creditAmount,
  //       mainWallet: creditAmount,   
  //     },
  //   },
  //   { new: true } 
  // );

  //       // 🗂 Update investment progress
  //       inv.daysCompleted += 1;
  //       inv.lastPaidDate = today;

  //       if (inv.daysCompleted >= inv.totalDays) {
  //         inv.status = "COMPLETED";
  //       }

  //       await inv.save();
  //     }

  //     console.log("🎯 Daily ROI distribution completed successfully.");

  //   } catch (error) {
  //     console.error("❌ Error distributing ROI:", error);
  //   }
  // }

  // module.exports = distributeDailyROI;



//   const cron = require("node-cron");
// const User = require("../models/user.Model");
// const Investment = require("../models/Investment.model");
// const { mongoose } = require("mongoose");
// const RoiHistory = require("../models/RoiHistory.model");
// // 🧪 Testing mode flag
// const TESTING_MODE = true; // Production mein isko false kar dena

// function isSameDay(date1, date2) {
//   if (!date1 || !date2) return false;
//   return (
//     date1.getFullYear() === date2.getFullYear() &&
//     date1.getMonth() === date2.getMonth() &&
//     date1.getDate() === date2.getDate()
//   );
// }

// function isSameMinute(date1, date2) {
//   if (!date1 || !date2) return false;
//   return (
//     date1.getFullYear() === date2.getFullYear() &&
//     date1.getMonth() === date2.getMonth() &&
//     date1.getDate() === date2.getDate() &&
//     date1.getHours() === date2.getHours() &&
//     date1.getMinutes() === date2.getMinutes()
//   );
// }

// async function distributeDailyROI() {
//   const now = new Date();

//   try {
//     const investments = await Investment.find({
//       status: "ACTIVE",
//       daysCompleted: { $lt: mongoose.Types.Decimal128.fromString("200") }
//     });

//     console.log(`📊 Found ${investments.length} active investments`);

//     for (const inv of investments) {
//       // 🧪 Testing mode: Check same minute, Production: Check same day
//       const alreadyPaid = TESTING_MODE 
//         ? isSameMinute(inv.lastPaidDate, now)
//         : isSameDay(inv.lastPaidDate, now);

//       if (alreadyPaid) {
//         console.log(`⏭ Skipping investment ${inv._id} - already paid this ${TESTING_MODE ? 'minute' : 'day'}`);
//         continue;
//       }

//       const amount = Number(inv.amount);
//       const rate = Number(inv.dailyRate) / 100;
//       const dailyROI = amount * rate;
//       const creditAmount = Math.floor(dailyROI * 100) / 100;

//       console.log(`💰 Distributing ₹${creditAmount} to user ${inv.userId} (Investment: ${inv._id})`);

//       // Credit to user wallet
//       const updatedUser = await User.findByIdAndUpdate(
//         inv.userId,
//         {
//           $inc: {
//             totalEarnings: creditAmount,
//             mainWallet: creditAmount,
//           },
//         },
//         { new: true }
//       );

//       if (updatedUser) {
//         console.log(`✅ User ${inv.userId} wallet updated: ₹${updatedUser.mainWallet}`);
//       }

//       // ✅ Properly increment Decimal128
//       const currentDays = Number(inv.daysCompleted);
//       inv.daysCompleted = mongoose.Types.Decimal128.fromString(
//         (currentDays + 1).toString()
//       );
//       inv.lastPaidDate = now;

//       // Check if completed
//       if (Number(inv.daysCompleted) >= Number(inv.totalDays)) {
//         inv.status = "COMPLETED";
//         console.log(`✅ Investment ${inv._id} completed!`);
//       }

//       await inv.save();
//       console.log(`📝 Investment ${inv._id} saved - Days: ${currentDays + 1}/${Number(inv.totalDays)}`);
//     }

//     console.log("🎯 Daily ROI distribution completed successfully.");
//   } catch (error) {
//     console.error("❌ Error distributing ROI:", error);
//   }
// }

// module.exports = distributeDailyROI;



const cron = require("node-cron");
const User = require("../models/user.Model");
const Investment = require("../models/Investment.model");
const RoiHistory = require("../models/RoiHistory.model");
const { mongoose } = require("mongoose");

// 🧪 Testing mode flag
const TESTING_MODE = false; // Production mein isko false kar dena

function isSameDay(date1, date2) {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isSameMinute(date1, date2) {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate() &&
    date1.getHours() === date2.getHours() &&
    date1.getMinutes() === date2.getMinutes()
  );
}

async function distributeDailyROI() {
  const now = new Date();

  try {
    const investments = await Investment.find({
      status: "ACTIVE",
      daysCompleted: { $lt: mongoose.Types.Decimal128.fromString("200") }
    });

    console.log(`📊 Found ${investments.length} active investments`);

    for (const inv of investments) {
      // 🧪 Testing mode: Check same minute, Production: Check same day
      const alreadyPaid = TESTING_MODE 
        ? isSameMinute(inv.lastPaidDate, now)
        : isSameDay(inv.lastPaidDate, now);

      if (alreadyPaid) {
        console.log(`⏭ Skipping investment ${inv._id} - already paid this ${TESTING_MODE ? 'minute' : 'day'}`);
        continue;
      }

      const amount = Number(inv.amount);
      const rate = Number(inv.dailyRate) / 100;
      const dailyROI = amount * rate;
      const creditAmount = Math.floor(dailyROI * 100) / 100;

      console.log(`💰 Distributing ₹${creditAmount} to user ${inv.userId} (Investment: ${inv._id})`);

      try {
        // Credit to user wallet
        const updatedUser = await User.findByIdAndUpdate(
          inv.userId,
          {
            $inc: {
              totalEarnings: creditAmount,
              mainWallet: creditAmount,
            },
          },
          { new: true }
        );

        if (!updatedUser) {
          throw new Error(`User ${inv.userId} not found`);
        }

        console.log(`✅ User ${inv.userId} wallet updated: ₹${updatedUser.mainWallet}`);

        // ✅ Properly increment Decimal128
        const currentDays = Number(inv.daysCompleted);
        const newDayNumber = currentDays + 1;
        
        inv.daysCompleted = mongoose.Types.Decimal128.fromString(
          newDayNumber.toString()
        );
        inv.lastPaidDate = now;

        // Check if completed
        if (Number(inv.daysCompleted) >= Number(inv.totalDays)) {
          inv.status = "COMPLETED";
          console.log(`✅ Investment ${inv._id} completed!`);
        }

        await inv.save();

        // 📝 Create ROI History Record
        await RoiHistory.create({
          userId: inv.userId,
          investmentId: inv._id,
          amount: inv.amount,
          dailyRate: inv.dailyRate,
          roiAmount: mongoose.Types.Decimal128.fromString(creditAmount.toString()),
          dayNumber: newDayNumber,
          distributionDate: now,
          status: "SUCCESS",
          remarks: `Day ${newDayNumber} ROI distributed successfully`,
        });

        console.log(`📝 Investment ${inv._id} saved - Days: ${newDayNumber}/${Number(inv.totalDays)}`);
        console.log(`📚 ROI History created for day ${newDayNumber}`);

      } catch (error) {
        console.error(`❌ Error processing investment ${inv._id}:`, error);

        // 📝 Create failed history record
        await RoiHistory.create({
          userId: inv.userId,
          investmentId: inv._id,
          amount: inv.amount,
          dailyRate: inv.dailyRate,
          roiAmount: mongoose.Types.Decimal128.fromString(creditAmount.toString()),
          dayNumber: Number(inv.daysCompleted) + 1,
          distributionDate: now,
          status: "FAILED",
          remarks: `Error: ${error.message}`,
        });
      }
    }

    console.log("🎯 Daily ROI distribution completed successfully.");
  } catch (error) {
    console.error("❌ Error distributing ROI:", error);
  }
}

module.exports = distributeDailyROI;