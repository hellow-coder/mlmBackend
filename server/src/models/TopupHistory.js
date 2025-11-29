const mongoose = require("mongoose");

const topupHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true },
    username: { type: String, required: true },
    amount: { type: Number, required: true },
    previousBalance: { type: Number, required: true },
    newBalance: { type: Number, required: true },
    doneBy: { type: String, required: true }, 
    transactionId: { type: String, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TopupHistory", topupHistorySchema);
