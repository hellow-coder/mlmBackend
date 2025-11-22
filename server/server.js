// require("dotenv").config();
// const app = require("./src/app");
// const connectDb = require("./db/db");
// const distributeDailyROI = require("./src/cron/dailyRoiJob")
// const PORT = process.env.PORT || 5000;

// connectDb()
//   .then(() => {
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
const cron = require("node-cron"); // 👉 Add this
const PORT = process.env.PORT || 5000;

connectDb()
  .then(() => {

    // 🕛 Schedule ROI Distribution at 12:00 AM (midnight)
    cron.schedule("0 0 * * *", async () => {
      console.log("⏰ Running daily ROI distribution...");
      await distributeDailyROI();
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("💥 Cannot start server without database");
    process.exit(1);
  });
