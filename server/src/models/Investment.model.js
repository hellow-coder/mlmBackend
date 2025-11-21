const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
      index: true,
    },

    amount: { type: Number, required: true },

    planType: { type: String, enum: ["LOW", "HIGH"], required: true },

    dailyRate: { type: Number, required: true }, // e.g. 0.015, 0.02

    startDate: { type: Date, default: Date.now },

    totalDays: { type: Number, required: true },

    daysCompleted: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "CANCELLED"],
      default: "ACTIVE",
    },

    refCommissionDistributed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // 🔥 Auto manages createdAt & updatedAt
);

// Optional: add index for faster daily ROI processing
// investmentSchema.index({ status: 1, daysCompleted: 1 });

const InvestmentModel = mongoose.model("InvestmentModel", investmentSchema);
module.exports = InvestmentModel;
