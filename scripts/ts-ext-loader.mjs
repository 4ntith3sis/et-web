// Loader resolusi ESM untuk menjalankan Payload CLI di Node 26 tanpa tsx.
//
// Payload CLI memuat payload.config.ts lewat tsx, yang pada Node 26 memicu
// bug interop CJS/ESM pada undici ("Illegal constructor" via CacheStorage).
// Node 26 sudah mendukung TypeScript secara native, tetapi tidak menambahkan
// ekstensi pada import relatif. Loader ini menyelesaikan import relatif
// tanpa ekstensi (mis. "./collections/Artikel") ke ".ts".
export async function resolve(specifier, context, nextResolve) {
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
