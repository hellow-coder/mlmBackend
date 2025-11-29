// // require("dotenv").config();
// // const app = require("./src/app");
// // const connectDb = require("./db/db");
// // const distributeDailyROI = require("./src/cron/dailyRoiJob")
// // const PORT = process.env.PORT || 5000;

// // connectDb()
// //   .then(() => {
// //     app.listen(PORT, () => {
// //       console.log(`🚀 Server running on port ${PORT}`);
// //     });
// //   })
// //   .catch((err) => {
// //     console.error("💥 Cannot start server without database");
// //     process.exit(1);
// //   });




// require("dotenv").config();
// const app = require("./src/app");
// const connectDb = require("./db/db");
// const distributeDailyROI = require("./src/cron/dailyRoiJob");
// const cron = require("node-cron"); // 👉 Add this
// const PORT = process.env.PORT || 5000;

// connectDb()
//   .then(() => {

    
//     cron.schedule("0 0 * * *", async () => {
//       console.log("⏰ Running daily ROI distribution...");
//       await distributeDailyROI();
//     });

//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("💥 Cannot start server without database");
//     process.exit(1);
//   });




require("dotenv").config();
const app = require("./src/app");
const connectDb = require("./db/db");
const distributeDailyROI = require("./src/cron/dailyRoiJob");
const cron = require("node-cron");
const PORT = process.env.PORT || 5000;

connectDb()
  .then(() => {
    // 🧪 TEST MODE: Har 1 minute
    // cron.schedule("* * * * *", async () => {
    //   console.log("⏰ [TEST] Running ROI distribution - Every 1 minute...");
    //   await distributeDailyROI();
    // });

    // 🚀 PRODUCTION MODE (uncomment when ready):
    cron.schedule("0 0 * * *", async () => {
      console.log("⏰ Running daily ROI distribution...");
      await distributeDailyROI();
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      // console.log("⏰ Cron job active - Testing every 1 minute");
    });
  })
  .catch((err) => {
    console.error("💥 Cannot start server without database");
    process.exit(1);
  });