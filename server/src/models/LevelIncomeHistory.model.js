const mongoose = require("mongoose");

const levelIncomeSchema = new mongoose.Schema({
  userId: {               
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  fromUserId: {          
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  investmentId: {        
    type: mongoose.Schema.Types.ObjectId,
    ref: "InvestmentModel",
    required: true,
  },
  level: {               
    type: Number,
    required: true,
  },
  percentage: {           
    type: Number,
    required: true,
  },
  amount: {               
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("LevelIncome", levelIncomeSchema);
