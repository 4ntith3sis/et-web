import assert from "node:assert/strict";
import { it } from "node:test";

import { WhatsAppNumbers } from "@/collections/WhatsAppNumbers";
import { SiteSettings } from "@/globals/SiteSettings";

it("koleksi routing mempertahankan slug dan hanya dipajang di grup sidebar WhatsApp", () => {
  assert.equal(WhatsAppNumbers.slug, "nomor-whatsapp");
  assert.equal(WhatsAppNumbers.admin?.group, "WhatsApp");
  assert.equal(WhatsAppNumbers.labels?.singular, "WhatsApp Routing");
  assert.equal(WhatsAppNumbers.labels?.plural, "WhatsApp Routing");
  const fields = WhatsAppNumbers.fields;
  for (const name of ["label", "phoneNumber", "enabled", "priority", "weight"]) {
    assert.ok(fields.some((field) => "name" in field && field.name === name), `missing ${name}`);
  }
});

it("Site Settings mempertahankan whatsappUrl sebagai nomor utama terpisah", () => {
  const tabs = SiteSettings.fields.find((field) => "tabs" in field);
  assert.ok(tabs && "tabs" in tabs);
  const contact = tabs.tabs.find((tab) => tab.label === "Kontak");
  const whatsapp = contact?.fields.find((field) => "name" in field && field.name === "whatsappUrl");
  assert.ok(whatsapp && "label" in whatsapp && "name" in whatsapp);
  assert.equal(whatsapp.label, "WhatsApp Resmi EasyTax (Halaman Kontak)");
  assert.equal(whatsapp.name, "whatsappUrl");
});
