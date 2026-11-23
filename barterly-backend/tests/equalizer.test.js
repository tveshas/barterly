import assert from "node:assert/strict";
import test from "node:test";
import { computeSettlement } from "../src/services/equalizer.service.js";

test("balanced swap needs no top-up", () => {
  const r = computeSettlement({ senderHours: 10, receiverHours: 10, senderRate: 20, receiverRate: 21 });
  assert.equal(r.balanced, true);
  assert.equal(r.options[0].id, "none");
});

test("sender receiving more value owes the gap in cash, extra hours or shorter session", () => {
  // sender gives 4h * $20 = $80, receives 10h * $30 = $300 -> sender owes $220
  const r = computeSettlement({ senderHours: 4, receiverHours: 10, senderRate: 20, receiverRate: 30 });
  assert.equal(r.gap, 220);
  assert.equal(r.payer, "sender");
  const byId = Object.fromEntries(r.options.map((o) => [o.id, o]));
  assert.equal(byId.cash.cashAmount, 220);
  assert.equal(byId.extra_hours.extraHours, 11); // 220 / 20
  assert.equal(byId.fewer_hours.reducedHours, 2.5); // 4*20/30 = 2.67 -> 2.5
});

test("receiver owes when the sender gives more value", () => {
  const r = computeSettlement({ senderHours: 10, receiverHours: 2, senderRate: 30, receiverRate: 20 });
  assert.equal(r.payer, "receiver");
  assert.equal(r.options.find((o) => o.id === "cash").cashAmount, -260);
});
