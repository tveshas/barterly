import api from "./api";

const walletService = {
  /** Balance (INR) and recent transactions */
  getWallet: async () => (await api.get("/wallet")).data,
  /** Add fake test money (there is no payment gateway) */
  topUp: async (amount) => (await api.post("/wallet/topup", { amount })).data,
};

export default walletService;
