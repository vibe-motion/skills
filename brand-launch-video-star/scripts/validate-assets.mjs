#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const schemaOnly = args.includes("--schema-only");
const manifestPath = args.find((arg) => !arg.startsWith("--"));

if (!manifestPath) {
  console.error(
    "Usage: node validate-assets.mjs <asset-manifest.json> [--schema-only]"
  );
  process.exit(2);
}

const absoluteManifestPath = resolve(manifestPath);
let manifest;

try {
  manifest = JSON.parse(readFileSync(absoluteManifestPath, "utf8"));
} catch (error) {
  console.error(`Cannot read manifest: ${error.message}`);
  process.exit(2);
}

const assets = Array.isArray(manifest) ? manifest : manifest.assets;
if (!Array.isArray(assets) || assets.length === 0) {
  console.error("Manifest must contain a non-empty assets array.");
  process.exit(1);
}

const allowedSourceTypes = new Set([
  "user-provided-original",
  "official-website",
  "official-static-bundle",
  "official-media-kit",
  "official-newsroom",
  "official-press-kit",
  "official-repository",
  "official-social",
  "official-media-library",
  "licensed-stock",
  "authorized-partner-kit",
]);
const officialSourceTypes = new Set(
  [...allowedSourceTypes].filter((sourceType) => sourceType !== "user-provided-original")
);
const strongLogoSourceTypes = new Set([
  "user-provided-original",
  "official-website",
  "official-static-bundle",
  "official-media-kit",
  "official-newsroom",
  "official-press-kit",
  "official-repository",
]);
const required = [
  "id",
  "role",
  "localPath",
  "sourceUrl",
  "sourceType",
  "verifiedAgainst",
  "rightsNote",
  "authenticity",
];
const errors = [];
const ids = new Set();

const isHttpsUrl = (value) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

for (const [index, asset] of assets.entries()) {
  const label = asset?.id || `asset[${index}]`;

  for (const field of required) {
    if (typeof asset?.[field] !== "string" || asset[field].trim() === "") {
      errors.push(`${label}: missing ${field}`);
    }
  }

  if (ids.has(asset?.id)) errors.push(`${label}: duplicate id`);
  ids.add(asset?.id);

  if (!allowedSourceTypes.has(asset?.sourceType)) {
    errors.push(`${label}: unsupported sourceType "${asset?.sourceType}"`);
  }
  if (asset?.authenticity !== "verified") {
    errors.push(`${label}: authenticity must equal "verified"`);
  }

  const userProvided = asset?.sourceType === "user-provided-original";
  if (userProvided && !asset?.sourceUrl?.startsWith("user-provided://")) {
    errors.push(`${label}: user-provided sourceUrl must use user-provided://`);
  }
  if (officialSourceTypes.has(asset?.sourceType) && !isHttpsUrl(asset?.sourceUrl)) {
    errors.push(`${label}: official/licensed sourceUrl must be a valid HTTPS URL`);
  }
  if (!userProvided && !isHttpsUrl(asset?.verifiedAgainst)) {
    errors.push(`${label}: verifiedAgainst must be a valid official HTTPS URL`);
  }
  if (/logo|wordmark|brand[-_ ]?mark/i.test(asset?.role || "") &&
      !strongLogoSourceTypes.has(asset?.sourceType)) {
    errors.push(`${label}: logo source is not strong enough`);
  }

  if (schemaOnly) continue;

  const localPath = resolve(
    dirname(absoluteManifestPath),
    asset?.localPath || ""
  );
  if (!existsSync(localPath)) {
    errors.push(`${label}: local file not found at ${localPath}`);
    continue;
  }
  try {
    if (!statSync(localPath).isFile()) {
      errors.push(`${label}: localPath must reference a file`);
      continue;
    }
    if (asset?.checksum) {
      const actual = createHash("sha256")
        .update(readFileSync(localPath))
        .digest("hex");
      const expected = asset.checksum.replace(/^sha256:/, "").toLowerCase();
      if (actual !== expected) {
        errors.push(`${label}: SHA-256 checksum mismatch`);
      }
    }
  } catch (error) {
    errors.push(`${label}: cannot inspect local file: ${error.message}`);
  }
}

if (errors.length > 0) {
  console.error(`Asset validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Asset manifest ${schemaOnly ? "schema" : "local artifact"} validation passed: ${assets.length} asset(s).`
);
