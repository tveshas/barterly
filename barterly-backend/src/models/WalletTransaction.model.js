import mongoose from "mongoose";

// Ledger of fake-money wallet movements (INR). No real payments are involved.
const walletTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    kind: {
      type: String,
      enum: ["signup_bonus", "topup", "barter_payment", "barter_receipt"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true },
    description: { type: String, trim: true, maxlength: 200 },
    counterparty: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    barter: { type: mongoose.Schema.Types.ObjectId, ref: "BarterRequest" },
  },
  { timestamps: true },
);

walletTransactionSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("WalletTransaction", walletTransactionSchema);
