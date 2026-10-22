import type { Metadata } from "next";

export type OpsiMetadata = {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  noIndex?: boolean;
};

export function buatMetadata({
  title,
  description = "Jasa konsultan pajak dan akuntansi terpercaya untuk UMKM dan perusahaan di Indonesia.",
  image,
  url,
  type = "website",
  noIndex = false,
}: OpsiMetadata): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://easytax.id";

  return {
    title: `${title} | EasyTax`,
    description,
    ...(url ? { metadataBase: new URL(siteUrl) } : {}),
    openGraph: {
      title: `${title} | EasyTax`,
      description,
      ...(image ? { images: [image] } : {}),
      type,
      locale: "id_ID",
      siteName: "EasyTax",
      ...(url ? { url } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export * from "@/fields/seo";
