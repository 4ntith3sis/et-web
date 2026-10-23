import assert from "node:assert/strict";
import { it } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { Tombol } from "@/components/ui/Tombol";
import { ConsultationButton } from "@/features/whatsapp/components/ConsultationButton";

function renderTombol(props: React.ComponentProps<typeof Tombol>): string {
  return renderToStaticMarkup(React.createElement(Tombol, props));
}

it("Tombol internal dengan external=false tidak meneruskan external ke DOM dan mempertahankan href internal", () => {
  const markup = renderTombol({ href: "/layanan", external: false, children: "Layanan" });
  assert.match(markup, /^<a[^>]*href="\/layanan"/);
  assert.doesNotMatch(markup, /\bexternal(?:=|\s|>)/);
});

it("Tombol eksternal dengan external=true tidak meneruskan external dan mempertahankan target eksternal", () => {
  const markup = renderTombol({ href: "https://wa.me/6281234567890", external: true, children: "WhatsApp" });
  assert.match(markup, /^<a[^>]*href="https:\/\/wa\.me\/6281234567890"/);
  assert.match(markup, /target="_blank"/);
  assert.match(markup, /rel="noopener noreferrer"/);
  assert.doesNotMatch(markup, /\bexternal(?:=|\s|>)/);
});

it("Tombol internal tanpa prop external tetap menggunakan href internal", () => {
  const markup = renderTombol({ href: "/kontak", children: "Kontak" });
  assert.match(markup, /^<a[^>]*href="\/kontak"/);
  assert.doesNotMatch(markup, /\bexternal(?:=|\s|>)/);
});

it("Tombol dengan navigasiPenuh memakai anchor browser biasa untuk route internal", () => {
  const markup = renderTombol({ href: "/api/konsultasi/whatsapp", navigasiPenuh: true, children: "WhatsApp" });
  assert.match(markup, /^<a[^>]*href="\/api\/konsultasi\/whatsapp"/);
  assert.doesNotMatch(markup, /\bexternal(?:=|\s|>)/);
});

it("button biasa tidak menerima atribut external untuk true, false, maupun tidak diberikan", () => {
  const falseMarkup = renderTombol({ type: "button", external: false, children: "Aksi" });
  const trueMarkup = renderTombol({ type: "button", external: true, children: "Aksi" });
  const defaultMarkup = renderTombol({ type: "button", children: "Aksi" });
  for (const markup of [falseMarkup, trueMarkup, defaultMarkup]) {
    assert.match(markup, /^<button[^>]*type="button"/);
    assert.doesNotMatch(markup, /\bexternal(?:=|\s|>)/);
  }
});

it("ConsultationButton dapat dirender tanpa warning React external dan menghasilkan href endpoint konsultasi", () => {
  const errors: string[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    errors.push(args.map(String).join(" "));
  };

  let markup: string;
  try {
    markup = renderToStaticMarkup(
      React.createElement(ConsultationButton, { sumber: "navbar", children: "Konsultasi Gratis" }),
    );
  } finally {
    console.error = originalError;
  }

  assert.match(markup!, /^<a[^>]*href="\/api\/konsultasi\/whatsapp\?/);
  assert.doesNotMatch(markup!, /\bexternal(?:=|\s|>)/);
  assert.deepEqual(errors, []);
});

it("ConsultationButton memakai navigasi dokumen langsung dan tidak menjadi Next Link RSC fetch", () => {
  const markup = renderToStaticMarkup(
    React.createElement(ConsultationButton, { sumber: "navbar", children: "Konsultasi Gratis" }),
  );
  assert.match(markup, /^<a[^>]*href="\/api\/konsultasi\/whatsapp\?/);
  assert.doesNotMatch(markup, /data-discover=/);
  assert.doesNotMatch(markup, /\bexternal(?:=|\s|>)/);
});
