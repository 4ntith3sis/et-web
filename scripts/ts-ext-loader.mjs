// Loader resolusi ESM untuk menjalankan Payload CLI di Node 26 tanpa tsx.
//
// Payload CLI memuat payload.config.ts lewat tsx, yang pada Node 26 memicu
// bug interop CJS/ESM pada undici ("Illegal constructor" via CacheStorage).
// Node 26 sudah mendukung TypeScript secara native, tetapi tidak menambahkan
// ekstensi pada import relatif. Loader ini menyelesaikan import relatif
// tanpa ekstensi (mis. "./collections/Artikel") ke ".ts".
//
// Loader juga memetakan alias `tsconfig.json#paths` ("@/*" -> "./src/*") agar
// berkas sumber aplikasi bisa diimpor oleh test runner (`node --test`) tanpa
// Next.js.
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const AKAR = dirname(dirname(fileURLToPath(import.meta.url)));

/**
 * Stub `next/cache` untuk lingkungan uji.
 *
 * Modul `next/cache` hanya bisa dipakai di dalam runtime Next.js, sedangkan
 * test runner berjalan di Node biasa. Stub ini membuat `cacheLife`,
 * `cacheTag`, dan friends menjadi no-op sehingga modul aplikasi tetap bisa
 * diimpor (fungsi ber-direktif `"use cache"` tetap berjalan normal, hanya
 * cache Next-nya yang dilewati).
 *
 * Diaktifkan lewat env `EASYTAX_STUB_NEXT_CACHE=1`.
 */
const STUB_NEXT_CACHE = process.env.EASYTAX_STUB_NEXT_CACHE === "1";
const STUB_NEXT_CACHE_URL =
  "data:text/javascript," +
  encodeURIComponent(
    [
      "export const cacheLife = () => {};",
      "export const cacheTag = () => {};",
      "export const revalidateTag = () => {};",
      "export const updateTag = () => {};",
      "export const revalidatePath = () => {};",
      "export const refresh = () => {};",
      "export const unstable_cache = (fn) => fn;",
      "export const unstable_noStore = () => {};",
      "export const unstable_cacheLife = () => {};",
      "export const unstable_cacheTag = () => {};",
      "export const io = {};",
      "export const navigation = {};",
      "export const prefetch = () => {};",
    ].join("\n"),
  );

/** Alias yang setara `tsconfig.json#paths`. */
const ALIAS = [
  { prefiks: "@payload-config", target: join(AKAR, "src", "payload.config.ts") },
  { prefiks: "@/", target: join(AKAR, "src") },
];

function keJalur(specifier) {
  for (const { prefiks, target } of ALIAS) {
    if (specifier === prefiks || specifier.startsWith(prefiks)) {
      const sisa = specifier.slice(prefiks.length);
      const dasar = prefiks.endsWith("/")
        ? join(target, sisa)
        : join(target, sisa.replace(/^\//, ""));
      return dasar;
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (STUB_NEXT_CACHE && specifier === "next/cache") {
    return { url: STUB_NEXT_CACHE_URL, shortCircuit: true };
  }

  // `next/server` tidak punya entri ESM tanpa ekstensi. Next.js membangunnya
  // lewat bundler, tetapi test runner Node memerlukan `next/server.js`.
  if (specifier === "next/server") {
    return nextResolve("next/server.js", context);
  }

  const alias = keJalur(specifier);
  if (alias) {
    const url = pathToFileURL(alias).href;
    try {
      return await nextResolve(url, context);
    } catch {
      try {
        return await nextResolve(`${url}.ts`, context);
      } catch {
        try {
          return await nextResolve(`${url}/index.ts`, context);
        } catch {
          return nextResolve(`${url}.tsx`, context);
        }
      }
    }
  }

  const relatif = specifier.startsWith("./") || specifier.startsWith("../");
  const punyaEkstensi = /\.(?:[cm]?[jt]sx?|json)$/.test(specifier);

  if (relatif && !punyaEkstensi) {
    try {
      return await nextResolve(specifier, context);
    } catch {
      try {
        return await nextResolve(`${specifier}.ts`, context);
      } catch {
        return nextResolve(`${specifier}/index.ts`, context);
      }
    }
  }

  return nextResolve(specifier, context);
}
