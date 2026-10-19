import config from "@payload-config";
import { getPayload } from "payload";

/**
 * Singleton klien Payload Local API untuk dipakai server component & route
 * handler. Memanfaatkan caching koneksi internal Payload, jadi aman dipanggil
 * berkali-kali.
 */
export const getClient = () => getPayload({ config });
