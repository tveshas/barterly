import express from "express";
import * as walletController from "../controllers/wallet.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { topUpSchema } from "../validations/wallet.validation.js";

const router = express.Router();
router.use(authenticate);

// Fake-money wallet (INR). No payment gateway.
router.get("/", walletController.getWallet);
router.post("/topup", validate(topUpSchema), walletController.topUp);

export default router;
