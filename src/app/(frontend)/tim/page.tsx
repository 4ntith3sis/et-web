import type { Metadata } from "next";

import { TimKonsultan } from "@/components/sections/TimKonsultan";
import { CTA } from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "Tim Konsultan Pajak & Akuntansi | EasyTax",
  description:
    "Kenali tim konsultan pajak dan akuntansi EasyTax bersertifikat BKP yang siap mendampingi kebutuhan kepatuhan perpajakan perusahaan Anda.",
};

export default function TimPage() {
  return (
    <main className="pt-8">
      <TimKonsultan />
      <CTA />
    </main>
  );
}
