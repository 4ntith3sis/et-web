import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getClient } from "@/lib/payload";
import { punyaPeranStaf } from "@/lib/auth";
import { layoutDefault } from "@/puck/default-layouts";
import { lengkapiLayoutDefaultProps } from "@/puck/default-props";
import { ambilHomepageMetadata } from "@/features/homepage/queries";
import { HomepageEditor } from "@/features/homepage/puck/HomepageEditor";
import type { LayoutPuck } from "@/features/homepage/puck/types";

export const metadata: Metadata = {
  title: "Homepage Editor | EasyTax Admin",
  robots: { index: false, follow: false },
};

export default async function HomepageEditorPage() {
  await connection();
  const payload = await getClient();
  const { user } = await payload.auth({
    headers: (await headers()) as unknown as Headers,
  });

  if (!user || !punyaPeranStaf(user)) {
    redirect("/admin/login?redirect=/admin/homepage-editor");
  }

  const res = await payload.find({
    collection: "page-layouts",
    where: { pageKey: { equals: "beranda" } },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  });

  const tersimpan = res.docs[0] as { id?: unknown; layout?: unknown; revision?: number } | undefined;
  let dok = tersimpan && tersimpan.id != null ? tersimpan : undefined;

  if (!dok) {
    const awal = layoutDefault("beranda") ?? { root: {}, content: [] };
    try {
      dok = (await payload.create({
        collection: "page-layouts",
        data: {
          pageKey: "beranda",
          judul: "Beranda",
          rute: "/",
          layout: awal,
          revision: 0,
        } as never,
        draft: true,
        overrideAccess: true,
      })) as { id?: unknown; layout?: unknown; revision?: number };
    } catch {
      const ulang = await payload.find({
        collection: "page-layouts",
        where: { pageKey: { equals: "beranda" } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      });
      dok = ulang.docs[0] as { id?: unknown; layout?: unknown; revision?: number } | undefined;
    }
  }

  const mentah = (dok?.layout as LayoutPuck) || layoutDefault("beranda") || { root: {}, content: [] };
  const layoutSiap = lengkapiLayoutDefaultProps(mentah, "beranda");
  const metadata = await ambilHomepageMetadata();

  return (
    <HomepageEditor
      initialLayout={layoutSiap}
      initialRevision={typeof dok?.revision === "number" ? dok.revision : 0}
      metadata={metadata}
    />
  );
}
