


const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    referralCode: {
      type: String,
      unique: true, 
      index: true,
    },

    sponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      default: null,
      index: true,
    },

    referredUsers: [
      { 
        
        type: mongoose.Schema.Types.ObjectId, 
        ref: "UserModel" 
      }
    ],

    username: {
      type: String,
      unique: true, 
    },

    phone: {
      type: Number,
      unique: true,
      required: true,
    },
    level: {
  type: Number,
  default: 1,  
},


    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    left: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      default: null,
    },
    right: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      default: null,
    },
      parentId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "UserModel",
  default: null,
},
    position: { type: String, enum: ["left", "right", null], default: null },

    // Wallet & earnings
    totalEarnings: { type: Number, default: 0 },
    currentEarnings: { type: Number, default: 0 },
    totalPayouts: { type: Number, default: 0 },
    levelIncome: { type: Number, default: 0 },
    directReferralAmount: { type: Number, default: 0 },

    investments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Investment" }],
    totalInvestment: { type: Number, default: 0 },
    mainWallet: {
  type: mongoose.Schema.Types.Decimal128,
  default: 0.0
},

    // Security & access control
    twoFASecret: { type: String },
    loginBlocked: { type: Boolean, default: false },
    loginBlockedDate: { type: Date, default: null },

    isEmailVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: Boolean, default: true },

    withdrawalBlock: { type: Boolean, default: false },
    dailyWithdrawalLimit: { type: Number, default: null },
    withdrawalCount: { type: Number, default: 0 },
    lastWithdrawalDate: { type: Date, default: null },

    activeDate: { type: Date, default: null },
  },
  
  { timestamps: true }
);


const UserModel = mongoose.model("UserModel", userSchema);
module.exports = UserModel;
