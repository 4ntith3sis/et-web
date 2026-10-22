"use client";

import { useState } from "react";

import type { FaqLayanan } from "@/data/layanan-detail";

/**
 * FAQ layanan — diport dari `ServiceFAQ` easytax-demo: satu item terbuka
 * pada satu waktu; klik ulang akan menutupnya.
 */
export function FaqLayanan({
  faq,
  desain,
}: {
  faq: FaqLayanan[];
  desain?: { lencana?: string; judul?: string };
}) {
  const [aktif, setAktif] = useState(0);
  const lencana = desain?.lencana ?? "FAQ";
  const judul = desain?.judul ?? "Pertanyaan Seputar Layanan";

  if (faq.length === 0) return null;

  return (
    <section
      id="faq"
      aria-labelledby="faq-judul"
      className="bg-netral-lat py-[clamp(44px,6.4vw,64px)]"
    >
      <div className="mx-auto w-full max-w-maks px-6 md:px-8">
        <div className="mx-auto mb-10 max-w-[680px] text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-500/60 bg-yellow-500/12 px-5 py-2 text-[0.85rem] font-bold tracking-[0.04em] text-navy-900 uppercase">
            {lencana}
          </span>

          <h2
            id="faq-judul"
            className="font-heading text-[clamp(1.7rem,3vw,2.35rem)] leading-[1.25] font-bold text-navy-900"
          >
            {judul}
          </h2>
        </div>

        <div className="mx-auto max-w-[820px]">
          {faq.map((item, i) => {
            const terbuka = aktif === i;
            return (
              <div
                key={item.pertanyaan}
                className={
                  terbuka
                    ? "mb-4 overflow-hidden rounded-xl border border-navy-900 bg-white shadow-md"
                    : "mb-4 overflow-hidden rounded-xl border border-garis bg-netral-putih transition-[var(--transition-base)]"
                }
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => setAktif(terbuka ? -1 : i)}
                    aria-expanded={terbuka}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-heading text-[1.05rem] leading-[1.35] font-bold text-navy-900">
                      {item.pertanyaan}
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-navy-900 transition-transform duration-300"
                      style={{ transform: terbuka ? "rotate(45deg)" : "none" }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </button>
                </h3>

                {terbuka && (
                  <div className="px-6 pb-[22px] text-[0.95rem] leading-[1.7] text-teks-sekunder">
                    {item.jawaban}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}