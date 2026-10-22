import { Render } from "@puckeditor/core";

import { ambilMetadataPuck } from "@/cms/layout";
import { homepagePuckConfig } from "./config";
import type { LayoutPuck, KonteksHalaman } from "./types";

/**
 * Renderer Server Component untuk layout Puck Beranda.
 */
export async function HomepageRenderer({
  layout,
  konteks,
  trace,
}: {
  layout: LayoutPuck;
  konteks?: KonteksHalaman;
  trace?: { requestId: string; route: string; pageKey: string; source: "published" | "fallback"; revision?: number };
}) {
  const metadata = await ambilMetadataPuck(konteks);

  if (trace && process.env.EASYTAX_LAYOUT_TRACE === "1" && process.env.NODE_ENV === "development") {
    console.info("[homepage-renderer-trace]", {
      ...trace,
      requestId: trace.requestId,
      componentCount: layout.content.length,
      componentTypes: layout.content.map((item) => item.type),
      status: "passed_to_puck_render",
    });
  }

  return <Render config={homepagePuckConfig} data={layout} metadata={metadata} />;
}

export default HomepageRenderer;
