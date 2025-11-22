const express = require("express")
const app = express()
const cors = require("cors")
const userRouter = require("./routes/user.Routes")
const morgan = require("morgan");
const adminRouter = require("../src/routes/admin.Routes");

const distributeDailyROI = require("./cron/dailyRoiJob");

app.use(cors({
  origin: ["http://localhost:3005", "https://yourfrontend.com"],
  credentials: true
}));

app.use(express.json());
app.use(morgan("dev"));


app.use("/api/user",userRouter)
app.use("/api/admin",adminRouter)
app.get("/distribute", async (req, res) => {
  try {
    const result = await distributeDailyROI();
    res.json({ success: true,  message:"commision distributed successfully" ,result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = app