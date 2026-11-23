/** Turn the chosen option into the snapshot stored on the barter request. */
export const buildEqualization = (proposal, optionId) => {
  const option = proposal.options.find((o) => o.id === optionId) || proposal.options[0];
  let senderHours = proposal.sender.hours;
  let receiverHours = proposal.receiver.hours;

  if (option.id === "extra_hours") {
    if (option.extraHoursBy === "sender") senderHours += option.extraHours;
    else receiverHours += option.extraHours;
  }
  if (option.id === "fewer_hours") {
    if (option.reducedHoursBy === "sender") senderHours = option.reducedHours;
    else receiverHours = option.reducedHours;
  }

  return {
    senderHours,
    receiverHours,
    senderRate: proposal.sender.rate,
    receiverRate: proposal.receiver.rate,
    currency: proposal.currency,
    settlement: option.id,
    cashAmount: option.cashAmount || 0,
    note: option.description,
  };
};

