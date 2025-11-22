const mongoose = require("mongoose");
const User = require("../models/user.Model")
const directReferralIncomeSchema = new mongoose.Schema({
  userId: {              
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,     // Jis user ko paisa mila (receiver)
  },
  fromUserId: {         
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,     // Jis user ne invest kiya (income generate ki)
  },
  investmentId: {       
    type: mongoose.Schema.Types.ObjectId,
    ref: "InvestmentModel",
    required: true,     // Kis investment se ye income mili
  },
  amount: {             
    type: Number,
    required: true,     // Kitna paisa mila (₹)
  },
  percentage: {         
    type: Number,
    default: 3,         // 3% commission fixed
  },
  level: {
    type: Number,
    default: 1,         // Direct referral hammesha Level 1 hota hai
  },
  type: {               // Report aur filtering ke liye zaruri!
    type: String,
    default: "DIRECT_REFERRAL",
  },
  createdAt: {         
    type: Date,
    default: Date.now,
  },
});
 
module.exports = mongoose.model("DirectReferralIncome", directReferralIncomeSchema);
