import assert from "node:assert/strict";
import test from "node:test";

import {
  PASSWORD_MIN_LENGTH,
  emailSchema,
  getClientAddress,
  newPasswordSchema,
  rateLimitKey,
} from "../src/lib/security";

test("email addresses are trimmed and normalized", () => {
  assert.equal(emailSchema.parse("  Coach@Example.COM "), "coach@example.com");
});

test("new passwords enforce the documented policy", () => {
  assert.equal(PASSWORD_MIN_LENGTH, 10);
  assert.equal(newPasswordSchema.safeParse("short").success, false);
  assert.equal(newPasswordSchema.safeParse("alllowercase1").success, false);
  assert.equal(newPasswordSchema.safeParse("NoNumberHere").success, false);
  assert.equal(newPasswordSchema.safeParse("StrongPass1").success, true);
});

test("client address uses the first forwarded address", () => {
  const request = new Request("https://example.com", {
    headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
  });
  assert.equal(getClientAddress(request), "203.0.113.10");
});

test("rate-limit identifiers are normalized and never stored raw", () => {
  const first = rateLimitKey("register", " Coach@Example.com ");
  const second = rateLimitKey("register", "coach@example.COM");
  assert.equal(first, second);
  assert.equal(first.length, 64);
  assert.equal(first.includes("coach@example.com"), false);
});
