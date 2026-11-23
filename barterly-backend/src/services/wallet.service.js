import User from "../models/User.model.js";
import WalletTransaction from "../models/WalletTransaction.model.js";
import { AppError } from "../utils/apiResponse.utils.js";

export const SIGNUP_BONUS = 5000;
export const MAX_TOPUP = 10000;

const round2 = (n) => Math.round(n * 100) / 100;
export const inr = (n) =>
  `\u20B9${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const getWallet = async (userId, limit = 50) => {
  const [user, transactions] = await Promise.all([
    User.findById(userId).select("walletBalance"),
    WalletTransaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("counterparty", "name avatar"),
  ]);
  if (!user) throw new AppError("User not found", 404);
  return { balance: user.walletBalance ?? 0, currency: "INR", transactions };
};

/** Credit the wallet and write a ledger row. */
const credit = async (userId, amount, kind, description, extra = {}) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { walletBalance: amount } },
    { new: true },
  );
  if (!user) throw new AppError("User not found", 404);
  await WalletTransaction.create({
    user: userId,
    type: "credit",
    kind,
    amount,
    balanceAfter: user.walletBalance,
    description,
    ...extra,
  });
  return user.walletBalance;
};

/** Debit only if there is enough balance (atomic), and write a ledger row. */
const debit = async (userId, amount, kind, description, extra = {}) => {
  const user = await User.findOneAndUpdate(
    { _id: userId, walletBalance: { $gte: amount } },
    { $inc: { walletBalance: -amount } },
    { new: true },
  );
  if (!user) return null;
  await WalletTransaction.create({
    user: userId,
    type: "debit",
    kind,
    amount,
    balanceAfter: user.walletBalance,
    description,
    ...extra,
  });
  return user.walletBalance;
};

export const recordSignupBonus = async (userId) =>
  WalletTransaction.create({
    user: userId,
    type: "credit",
    kind: "signup_bonus",
    amount: SIGNUP_BONUS,
    balanceAfter: SIGNUP_BONUS,
    description: "Welcome bonus (test money)",
  });

/** Add fake money. There is no payment gateway; this is purely for testing. */
export const topUp = async (userId, amount) => {
  const value = round2(Number(amount));
  if (!Number.isFinite(value) || value <= 0 || value > MAX_TOPUP) {
    throw new AppError(`Enter an amount between ${inr(1)} and ${inr(MAX_TOPUP)}`, 400);
  }
  const balance = await credit(userId, value, "topup", "Added test money");
  return { balance, currency: "INR" };
};

export const getBalance = async (userId) => {
  const user = await User.findById(userId).select("walletBalance");
  return user?.walletBalance ?? 0;
};

/** Move money payer -> payee for an agreed barter cash top-up. */
export const transfer = async ({ fromId, toId, amount, barterId, fromName, toName }) => {
  const value = round2(amount);
  const paid = await debit(
    fromId,
    value,
    "barter_payment",
    `Cash top-up paid to ${toName || "your swap partner"}`,
    { counterparty: toId, barter: barterId },
  );
  if (paid === null) {
    throw new AppError(
      `${fromName || "The payer"} doesn't have enough in their wallet for the agreed ${inr(value)} top-up.`,
      400,
    );
  }
  try {
    await credit(
      toId,
      value,
      "barter_receipt",
      `Cash top-up received from ${fromName || "your swap partner"}`,
      { counterparty: fromId, barter: barterId },
    );
  } catch (err) {
    // Put the money back if the credit failed
    await credit(fromId, value, "topup", "Refund of failed transfer");
    throw err;
  }
};
