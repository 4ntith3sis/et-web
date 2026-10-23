import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { getPayload } from "payload";

const prompt = createInterface({ input: stdin, output: stdout });

function promptHidden(label) {
  return new Promise((resolve) => {
    if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
      throw new Error("Run this command in an interactive terminal so the password can be entered hidden");
    }
    stdout.write(label);
    stdin.setRawMode(true);
    let value = "";
    const onData = (chunk) => {
      const char = chunk.toString("utf8");
      if (char === "\u0003") {
        stdin.setRawMode(false);
        stdin.off("data", onData);
        stdout.write("\n");
        prompt.close();
        process.exit(130);
      }
      if (char === "\r" || char === "\n") {
        stdin.setRawMode(false);
        stdin.off("data", onData);
        stdout.write("\n");
        resolve(value);
      } else if (char === "\u007f" || char === "\b") {
        value = value.slice(0, -1);
      } else if (char >= " ") {
        value += char;
      }
    };
    stdin.on("data", onData);
  });
}

let payload;
try {
  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
    throw new Error("Run this command in an interactive terminal so the password can be entered hidden");
  }
  const email = (await prompt.question("Admin email: ")).trim();
  const password = await promptHidden("Admin password (hidden): ");
  const confirmation = await promptHidden("Confirm password (hidden): ");
  prompt.close();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("A valid email address is required");
  if (password.length < 16) throw new Error("Use an admin password with at least 16 characters");
  if (password !== confirmation) throw new Error("Passwords do not match");
  if (!process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET.length < 32) {
    throw new Error("PAYLOAD_SECRET is not configured correctly");
  }

  const { default: config } = await import("../src/payload.config.ts");
  payload = await getPayload({ config });
  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  });
  if (existing.docs.length) throw new Error("That admin email already exists; no account was changed");

  await payload.create({
    collection: "users",
    data: { email, password, nama: "Admin EasyTax", role: "admin" },
    overrideAccess: true,
  });
  console.log("Admin account created. Sign in at /admin; credentials were not printed.");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Admin creation failed");
  process.exitCode = 1;
} finally {
  prompt.close();
  if (payload) await payload.destroy();
}
