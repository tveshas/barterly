import { useEffect, useState } from "react";
import DashboardHeader from "../../components/layout/DashboardHeader";
import Sidebar from "../../components/layout/Sidebar";
import walletService from "../../services/walletService";
import { inr } from "../../utils/currency";

const QUICK_AMOUNTS = [500, 1000, 5000];

const Wallet = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await walletService.getWallet();
      setWallet(res.data);
      window.dispatchEvent(new Event("wallet-updated"));
    } catch {
      setError("Couldn't load your wallet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addMoney = async (amount) => {
    setError("");
    setAdding(true);
    try {
      await walletService.topUp(amount);
      setCustom("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't add money.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="font-display bg-[#FFFBF0] h-screen flex flex-col overflow-hidden">
      <DashboardHeader onMenuClick={() => setShowMobileSidebar(true)} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isOpen={showMobileSidebar} onClose={() => setShowMobileSidebar(false)} />

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-3xl mx-auto flex flex-col gap-8">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Wallet</h1>

            {/* Balance */}
            <div className="bg-primary border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col gap-4">
              <p className="text-xs font-bold uppercase tracking-widest">Available balance</p>
              <p className="text-5xl md:text-6xl font-black">
                {loading ? "…" : inr(wallet?.balance, { decimals: true })}
              </p>
              <p className="text-xs font-bold bg-white border-2 border-black px-3 py-2 w-fit">
                Test money only. No real payments or payment gateway.
              </p>
            </div>

            {/* Add money */}
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col gap-4">
              <p className="text-sm font-black uppercase">Add test money</p>
              <div className="flex flex-wrap gap-3">
                {QUICK_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    disabled={adding}
                    onClick={() => addMoney(a)}
                    className="px-5 py-2 border-2 border-black bg-white font-black hover:bg-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                  >
                    + {inr(a)}
                  </button>
                ))}
              </div>
              <form
                className="flex gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (Number(custom) > 0) addMoney(Number(custom));
                }}
              >
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder="Custom amount (max ₹10,000)"
                  className="flex-1 border-2 border-black px-3 py-2 font-bold"
                />
                <button
                  type="submit"
                  disabled={adding || !(Number(custom) > 0)}
                  className="px-5 py-2 border-2 border-black bg-black text-white font-black uppercase disabled:opacity-50"
                >
                  Add
                </button>
              </form>
              {error && <p className="text-sm font-bold text-red-600">{error}</p>}
            </div>

            {/* Transactions */}
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="p-4 border-b-2 border-black text-sm font-black uppercase">Transactions</p>
              {!wallet?.transactions?.length ? (
                <p className="p-6 text-sm font-bold text-gray-500 uppercase">No transactions yet</p>
              ) : (
                <ul>
                  {wallet.transactions.map((t) => (
                    <li
                      key={t._id}
                      className="flex items-center justify-between gap-4 p-4 border-b border-neutral-200 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{t.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(t.createdAt).toLocaleString()} · balance {inr(t.balanceAfter, { decimals: true })}
                        </p>
                      </div>
                      <p className={`font-black shrink-0 ${t.type === "credit" ? "text-green-700" : "text-red-600"}`}>
                        {t.type === "credit" ? "+" : "−"}
                        {inr(t.amount, { decimals: true })}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Wallet;
