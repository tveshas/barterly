import assert from "node:assert/strict";
import test from "node:test";
import {
  googleLoginSchema,
  devLoginSchema,
} from "../src/validations/auth.validation.js";

test("googleLoginSchema accepts a credential", () => {
  const result = googleLoginSchema.parse({
    body: { credential: "x".repeat(40), rememberMe: true },
  });
  assert.equal(result.body.rememberMe, true);
});

test("googleLoginSchema rejects a missing or tiny credential", () => {
  assert.throws(() => googleLoginSchema.parse({ body: {} }));
  assert.throws(() => googleLoginSchema.parse({ body: { credential: "abc" } }));
});

test("devLoginSchema lowercases email", () => {
  const result = devLoginSchema.parse({ body: { email: "ALICE@Test.com" } });
  assert.equal(result.body.email, "alice@test.com");
});
