// Mendaftarkan loader resolusi `.ts` lalu menjalankan Payload CLI tanpa tsx.
// Dipakai melalui: node --import ./scripts/register-payload-loader.mjs <bin> ...
import { register } from "node:module";

register("./ts-ext-loader.mjs", import.meta.url);
