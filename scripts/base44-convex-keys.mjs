// Generates the RS256 key pair Convex Auth expects as deployment environment
// variables (JWT_PRIVATE_KEY / JWKS). Mirrors what `npx @convex-dev/auth` does:
// jose's generateKeyPair("RS256") + exportPKCS8 + exportJWK, with the PEM
// flattened to a single line.
//
//   node scripts/base44-convex-keys.mjs <private-key-file> <jwks-file>
import { generateKeyPairSync } from "node:crypto";
import { writeFileSync } from "node:fs";

const [privateKeyPath, jwksPath] = process.argv.slice(2);
if (!privateKeyPath || !jwksPath) {
  console.error("usage: base44-convex-keys.mjs <private-key-file> <jwks-file>");
  process.exit(1);
}

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const pem = privateKey.export({ type: "pkcs8", format: "pem" }).trimEnd().replace(/\n/g, " ");
const jwk = publicKey.export({ format: "jwk" });

writeFileSync(privateKeyPath, pem, { mode: 0o600 });
writeFileSync(jwksPath, JSON.stringify({ keys: [{ use: "sig", ...jwk }] }));
