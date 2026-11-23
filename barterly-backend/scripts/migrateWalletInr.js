// One-off, idempotent migration: give every user a fake-money wallet (INR),
// convert old USD-era values, and drop the per-user currency field.
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import User from "../src/models/User.model.js";
import BarterRequest from "../src/models/BarterRequest.model.js";
import WalletTransaction from "../src/models/WalletTransaction.model.js";
import { SIGNUP_BONUS } from "../src/services/wallet.service.js";

await mongoose.connect(process.env.MONGODB_URI);
const USD_TO_INR = 80;

// Wallets
const w = await User.collection.updateMany({ walletBalance: { $exists: false } }, { $set: { walletBalance: SIGNUP_BONUS } });
const users = await User.find().select("_id walletBalance");
let bonuses = 0;
for (const u of users) {
  if (!(await WalletTransaction.exists({ user: u._id }))) {
    await WalletTransaction.create({
      user: u._id, type: "credit", kind: "signup_bonus", amount: u.walletBalance,
      balanceAfter: u.walletBalance, description: "Welcome bonus (test money)",
    });
    bonuses++;
  }
}

// Old USD-era hourly rates (small numbers) -> INR
const usdUsers = await User.collection.find({ currency: "USD", hourlyRate: { $gt: 0, $lt: 100 } }).toArray();
for (const u of usdUsers) await User.collection.updateOne({ _id: u._id }, { $set: { hourlyRate: u.hourlyRate * USD_TO_INR } });
await User.collection.updateMany({}, { $unset: { currency: "" } });

// Old USD-era fair-trade snapshots on requests -> INR
let converted = 0;
for (const b of await BarterRequest.collection.find({ "equalization.currency": { $ne: "INR" }, equalization: { $exists: true } }).toArray()) {
  const e = b.equalization;
  await BarterRequest.collection.updateOne({ _id: b._id }, { $set: {
    "equalization.currency": "INR",
    "equalization.senderRate": (e.senderRate || 0) * USD_TO_INR,
    "equalization.receiverRate": (e.receiverRate || 0) * USD_TO_INR,
    "equalization.cashAmount": (e.cashAmount || 0) * USD_TO_INR,
  } });
  converted++;
}
console.log(`wallets set: ${w.modifiedCount}, bonus rows: ${bonuses}, rates converted: ${usdUsers.length}, requests converted: ${converted}`);
process.exit(0);
