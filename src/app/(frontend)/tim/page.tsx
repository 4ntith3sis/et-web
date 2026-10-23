import type { Metadata } from "next";

import { TimKonsultan } from "@/components/sections/TimKonsultan";
import { CTA } from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "Tim Konsultan | EasyTax",
  description:
    "Tim konsultan pajak dan akuntan bersertifikat EasyTax yang siap membantu kebutuhan perpajakan dan keuangan bisnis Anda.",
  alternates: { canonical: "/tim" },
  openGraph: {
    title: "Tim Konsultan | EasyTax",
    description:
      "Tim konsultan pajak dan akuntan bersertifikat EasyTax yang siap membantu bisnis Anda.",
    type: "website",
    locale: "id_ID",
    siteName: "EasyTax",
    url: "/tim",
  },
};

export default function TimPage() {
  return (
    <main className="pt-8">
      <TimKonsultan />
      <CTA />
    </main>
  );
}
