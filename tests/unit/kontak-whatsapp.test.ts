import assert from "node:assert/strict";
import { it } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { KontakHero } from "@/components/sections/KontakHero";

it("aksi WhatsApp Kontak membentuk wa.me dari nomor Site Settings, tanpa endpoint konsultasi", () => {
  const html = renderToStaticMarkup(React.createElement(KontakHero, { nomorWhatsAppUtama: "+62 811-2222-3333" }));
  assert.match(html, /href="https:\/\/wa\.me\/6281122223333"/);
  assert.doesNotMatch(html, /\/api\/konsultasi\/whatsapp/);
  assert.doesNotMatch(html, /wa\.me\/[0-9]{8,16}\?text=/);
});

it("nomor utama kosong atau invalid tidak menghasilkan link WhatsApp statis", () => {
  for (const phone of [null, "", "bukan-nomor"]) {
    const html = renderToStaticMarkup(React.createElement(KontakHero, { nomorWhatsAppUtama: phone }));
    assert.doesNotMatch(html, /href="https:\/\/wa\.me\//);
    assert.doesNotMatch(html, /\/api\/konsultasi\/whatsapp/);
    assert.match(html, /WhatsApp belum dikonfigurasi/);
  }
});
