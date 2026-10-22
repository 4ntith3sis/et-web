import type { Data } from "@puckeditor/core";
import type { LayoutPuck, PropsRootPuck } from "@/puck/types";

export type {
  LayoutPuck,
  PropsRootPuck,
  KonteksHalaman,
  MetadataPuck,
  PropsPuck,
  NamaKomponenPuck,
} from "@/puck/types";

export type HomepageLayoutData = LayoutPuck;

export type HomepagePuckProps = {
  layout: LayoutPuck;
  revision?: number;
  source?: "published" | "fallback";
};
