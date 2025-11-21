require("dotenv").config();
const app = require("./src/app");
const connectDb = require("./db/db");

const PORT = process.env.PORT || 5000;

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("💥 Cannot start server without database");
    process.exit(1);
  });
