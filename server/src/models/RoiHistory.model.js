// models/RoiHistory.model.js

const mongoose = require("mongoose");
const InvestmentModel = require("../models/Investment.model")

const roiHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Fast queries ke liye
    },
    investmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InvestmentModel",
      required: true,
      index: true,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    dailyRate: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    roiAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    dayNumber: {
      type: Number,
      required: true,
    },
    distributionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt automatic
  }
);



module.exports = mongoose.model("RoiHistory", roiHistorySchema);