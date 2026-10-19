import { Render } from "@puckeditor/core";

import { ambilMetadataPuck } from "@/cms/layout";
import { puckConfig } from "@/puck/config";
import type { LayoutPuck } from "@/puck/types";

/**
 * Renderer layout Page Builder untuk halaman publik.
 *
 * Berjalan sebagai Server Component: `@puckeditor/core` memakai entri RSC
 * (`render`) lewat export condition `react-server`, sehingga hanya markup
 * yang dikirim ke klien. `ambilMetadataPuck()` menyuplai konten CMS dan
 * diteruskan sebagai `metadata` yang dapat dibaca komponen via
 * `puck.metadata`.
 *
 * Navbar & Footer TIDAK termasuk di sini — keduanya dimiliki layout situs
 * `(website)/layout.tsx`, jadi halaman tidak pernah menggandakannya.
 */
export async function PuckRender({ layout }: { layout: LayoutPuck }) {
  const metadata = await ambilMetadataPuck();

  return <Render config={puckConfig} data={layout} metadata={metadata} />;
}
