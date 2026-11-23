import { useState, useEffect } from "react";
import barterService from "../services/barterService";
import { buildEqualization } from "../utils/equalization";
import { inr } from "../utils/currency";
import walletService from "../services/walletService";

/**
 * AI moderator: shows how many hours each skill is worth, the money gap, and
 * ways to even it out. Reports the chosen settlement up via onChange.
 */
const FairTradeCalculator = ({ offeredSkillId, requestedSkillId, onChange }) => {
  const [proposal, setProposal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rates, setRates] = useState({ sender: "", receiver: "" });
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    walletService.getWallet().then((r) => setBalance(r.data.balance)).catch(() => {});
  }, []);

  // A different skill pairing invalidates any previous proposal
  useEffect(() => {
    setProposal(null);
    setSelected(null);
    setError("");
    onChange?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offeredSkillId, requestedSkillId]);

  const run = async (overrides = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await barterService.calculateEqualization({
        offeredSkillId,
        requestedSkillId,
        ...overrides,
      });
      const data = res.data;
      setProposal(data);
      setRates({ sender: String(data.sender.rate), receiver: String(data.receiver.rate) });
      const first = data.options[0].id;
      setSelected(first);
      onChange?.(buildEqualization(data, first));
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't calculate a fair trade. You can still send the request.");
    } finally {
      setLoading(false);
    }
  };

  const choose = (id) => {
    setSelected(id);
    onChange?.(buildEqualization(proposal, id));
  };

  const recalc = () => {
    const overrides = {};
    if (Number(rates.sender) > 0) overrides.senderRate = Number(rates.sender);
    if (Number(rates.receiver) > 0) overrides.receiverRate = Number(rates.receiver);
    run(overrides);
  };

  if (!offeredSkillId) return null;

  if (!proposal) {
    return (
      <div className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-xs font-bold uppercase tracking-wide mb-1">⚖️ Fair-trade check</p>
        <p className="text-xs font-medium text-gray-700 mb-3">
          Is this swap even? Our AI moderator compares the teaching time of both skills and shows how to balance it.
        </p>
        {error && <p className="text-xs font-bold text-red-600 mb-2">{error}</p>}
        <button
          type="button"
          onClick={() => run()}
          disabled={loading}
          className="w-full py-2 px-4 bg-primary border-2 border-black font-bold uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
        >
          {loading ? "Calculating..." : "Check if it's fair"}
        </button>
      </div>
    );
  }

  const { sender, receiver, gap, balanced, payer } = proposal;
  const chosen = proposal.options.find((o) => o.id === selected);
  const shortOnFunds = chosen?.id === "cash" && chosen.cashAmount > 0 && balance !== null && balance < chosen.cashAmount;

  return (
    <div className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide">⚖️ Fair-trade check</p>
        <span className="text-[10px] font-bold uppercase border border-black px-2 py-0.5 bg-neutral-100">
          {proposal.aiPowered ? "AI estimate" : "Basic estimate"}
        </span>
      </div>

      {/* Two sides */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          ["You teach", sender, "sender"],
          [`${receiver.name} teaches`, receiver, "receiver"],
        ].map(([label, side, key]) => (
          <div key={key} className="border-2 border-black p-2 bg-[#FFFBF0]">
            <p className="font-bold uppercase text-[10px] text-gray-500">{label}</p>
            <p className="font-black truncate">{side.skill}</p>
            <p className="font-medium">
              ~{side.hours} hrs · difficulty {side.difficulty}/10
            </p>
            <label className="flex items-center gap-1 mt-1 font-bold">
              ₹
              <input
                type="number"
                min="1"
                value={rates[key]}
                onChange={(e) => setRates((r) => ({ ...r, [key]: e.target.value }))}
                className="w-16 border border-black px-1 py-0.5 font-bold bg-white"
              />
              /hr{side.rateEstimated ? "*" : ""}
            </label>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-medium text-gray-600">
          {sender.rateEstimated || receiver.rateEstimated
            ? "* Estimated rate (not set on their profile). Edit rates and recalculate to see other scenarios."
            : "Rates come from profiles. Edit and recalculate for what-if scenarios."}
        </p>
        <button
          type="button"
          onClick={recalc}
          disabled={loading}
          className="shrink-0 text-[10px] font-bold uppercase border-2 border-black px-2 py-1 bg-white disabled:opacity-50"
        >
          {loading ? "..." : "Recalculate"}
        </button>
      </div>

      {proposal.rationale && (
        <p className="text-xs font-medium text-gray-800 border-l-4 border-black pl-2">{proposal.rationale}</p>
      )}

      {/* Verdict */}
      <p className="text-sm font-black">
        {balanced
          ? "✅ Pretty even — a straight swap works."
          : `${payer === "sender" ? "You'd" : `${receiver.name} would`} owe ${inr(Math.abs(gap), { decimals: true })} of value. Pick how to even it out:`}
      </p>

      <div className="flex flex-col gap-2">
        {proposal.options.map((o) => (
          <label
            key={o.id}
            className={`flex items-start gap-2 border-2 border-black p-2 cursor-pointer ${selected === o.id ? "bg-primary" : "bg-white"}`}
          >
            <input
              type="radio"
              name="settlement"
              checked={selected === o.id}
              onChange={() => choose(o.id)}
              className="mt-1"
            />
            <span className="text-xs">
              <span className="font-black uppercase">{o.title}</span>
              <br />
              <span className="font-medium">{o.description}</span>
            </span>
          </label>
        ))}
      </div>
      {shortOnFunds && (
        <p className="text-xs font-bold text-red-600">
          Your wallet has {inr(balance)}, less than this top-up. Add test money on the Wallet page first.
        </p>
      )}
      <p className="text-[10px] font-medium text-gray-600">
        Cash top-ups move test money between wallets when the request is accepted. No real payments.
        {balance !== null && ` Your wallet: ${inr(balance)}.`}
      </p>
    </div>
  );
};

export default FairTradeCalculator;
