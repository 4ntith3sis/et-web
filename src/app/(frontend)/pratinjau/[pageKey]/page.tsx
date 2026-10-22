import { headers } from "next/headers";
import { connection } from "next/server";
import { Suspense } from "react";
import type { Metadata } from "next";

import { PuckRender } from "@/components/puck/PuckRender";
import { konteksRepresentatif } from "@/cms/layout";
import { layoutDefault } from "@/puck/default-layouts";
import { lengkapiLayoutDefaultProps } from "@/puck/default-props";
import { DAFTAR_HALAMAN, halamanDariKey, type LayoutPuck } from "@/puck/types";
import { validasiLayoutPuck } from "@/puck/validation";
import { getClient } from "@/lib/payload";
import { punyaPeranStaf } from "@/components/admin/page-builder/role";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

/**
 * Pratinjau draft Page Builder (hanya untuk staf berwenang).
 *
 * Rute berada di dalam `(website)` supaya pratinjau menampilkan Navbar &
 * Footer yang sama dengan halaman publik. Akses dibatasi: pengguna harus
 * sudah masuk sebagai admin/editor. Dokumen dibaca dalam mode draft sehingga
 * perubahan yang belum diterbitkan tetap terlihat.
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Enumerasi kunci halaman agar shell rute dapat diprerender (Navbar memakai
 * `usePathname` yang butuh path diketahui saat build). Isinya tetap dinamis. */
export function generateStaticParams() {
  return DAFTAR_HALAMAN.map((halaman) => ({ pageKey: halaman.key }));
}

export default function HalamanPratinjau({
  params,
}: {
  params: Promise<{ pageKey: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "120px 24px", textAlign: "center", color: "#4b5563" }}>
          Memuat pratinjau…
        </div>
      }
    >
      <IsiPratinjau params={params} />
    </Suspense>
  );
}

async function IsiPratinjau({
  params,
}: {
  params: Promise<{ pageKey: string }>;
}) {
  await connection();
  const { pageKey } = await params;
  const halaman = halamanDariKey(pageKey);
  if (!halaman) notFound();

  const payload = await getClient();
  const { user } = await payload.auth({ headers: await headers() });

  if (!punyaPeranStaf(user)) {
    redirect(`/admin/login?redirect=${encodeURIComponent(`/pratinjau/${pageKey}`)}`);
  }

  const res = await payload.find({
    collection: "page-layouts",
    where: { pageKey: { equals: pageKey } },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  });

  const doc = res.docs[0] as { layout?: unknown } | undefined;
  const tervalidasi = doc ? validasiLayoutPuck(doc.layout) : { ok: false as const };
  const layoutTerpilih: LayoutPuck = tervalidasi.ok
    ? tervalidasi.data
    : (layoutDefault(pageKey) as LayoutPuck);
  const layout = lengkapiLayoutDefaultProps(layoutTerpilih, pageKey);

  /* Template detail memakai satu layout bersama; pratinjau tidak punya slug
     aktif, jadi komponen dinamis diberi konteks contoh agar tampil realistis.
     Data ini tidak pernah disimpan di layout. */
  const konteks = await konteksRepresentatif(pageKey);

  return (
    <>
      <div
        role="status"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#111827",
          color: "#fef3c7",
          padding: "8px 16px",
          fontSize: 13,
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        Mode pratinjau draft — perubahan belum tampil di halaman publik.
      </div>
      <PuckRender layout={layout} konteks={konteks} />
    </>
  );
}
