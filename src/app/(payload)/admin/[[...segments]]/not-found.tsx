import { NotFoundPage } from "@payloadcms/next/views";
import config from "@payload-config";
import type { Metadata } from "next";

import { importMap } from "../importMap.js";

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

export const generateMetadata = (): Promise<Metadata> =>
  Promise.resolve({ title: "Halaman tidak ditemukan — EasyTax CMS" });

const NotFound = ({ params, searchParams }: Args) =>
  NotFoundPage({ config, importMap, params, searchParams });

export default NotFound;
