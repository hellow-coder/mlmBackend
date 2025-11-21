const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    return conn; 
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    throw err; 
    
  }
};

module.exports = connectDb;
