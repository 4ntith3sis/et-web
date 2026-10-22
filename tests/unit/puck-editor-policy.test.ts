import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { bolehEditDenganPuck, KUNCI_PUCK_BERANDA } from "@/puck/editor-policy";

describe("Puck editor page allowlist", () => {
  it("allows the existing homepage key", () => {
    assert.equal(KUNCI_PUCK_BERANDA, "beranda");
    assert.equal(bolehEditDenganPuck("beranda"), true);
  });

  it("rejects every other registered or arbitrary key", () => {
    for (const key of [
      "tentang-kami",
      "kontak",
      "layanan-listing",
      "template-layanan-detail",
      "not-a-page",
      "",
    ]) {
      assert.equal(bolehEditDenganPuck(key), false, `should reject ${key}`);
    }
  });
});
