import config from "@payload-config";
import { getPayload } from "payload";

/**
 * Singleton klien Payload Local API untuk Server Components & Route Handlers.
 * Memanfaatkan caching koneksi internal Payload.
 */
export const getClient = () => getPayload({ config });
