import { spawnSync } from "node:child_process";

const source = process.env.DATABASE_URI || process.env.DATABASE_URL;
if (source) {
  const host = new URL(source);
  if (host.hostname === "postgres") {
    host.hostname = "127.0.0.1";
    host.port = process.env.POSTGRES_PORT || "55432";
    process.env.EASYTAX_BUILD_DATABASE_URI = host.toString();
  }
}

const result = spawnSync(
  process.execPath,
  ["node_modules/next/dist/bin/next", "build"],
  { stdio: "inherit", env: process.env },
);

process.exit(result.status ?? 1);
