import * as walletService from "../services/wallet.service.js";
import { successResponse } from "../utils/apiResponse.utils.js";

export const getWallet = async (req, res, next) => {
  try {
    return successResponse(res, 200, "Wallet retrieved", await walletService.getWallet(req.user._id));
  } catch (error) {
    next(error);
  }
};

export const topUp = async (req, res, next) => {
  try {
    const result = await walletService.topUp(req.user._id, req.body.amount);
    return successResponse(res, 200, "Test money added", result);
  } catch (error) {
    next(error);
  }
};
