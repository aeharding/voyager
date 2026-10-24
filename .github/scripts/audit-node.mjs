import assert from "node:assert/strict";
import { appendFileSync, readFileSync } from "node:fs";

const pin = readFileSync(".tool-versions", "utf8").match(
  /^nodejs\s+(\d+\.\d+\.\d+)\s*$/m,
)?.[1];
assert(pin, "Expected an exact Node.js version in .tool-versions");
const major = Number(pin.split(".")[0]);

async function getJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  assert(response.ok, `${url}: HTTP ${response.status}`);
  return response.json();
}

const [releases, schedule] = await Promise.all([
  getJson("https://nodejs.org/dist/index.json"),
  getJson(
    "https://raw.githubusercontent.com/nodejs/Release/main/schedule.json",
  ),
]);
assert(Array.isArray(releases), "Unexpected Node.js release index");
const line = schedule[`v${major}`];
assert(line?.end, `No support schedule for Node.js ${major}`);

function compareVersions(a, b) {
  const left = a.replace(/^v/, "").split(".").map(Number);
  const right = b.replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (left[i] !== right[i]) return left[i] - right[i];
  }
  return 0;
}

assert(
  releases.some((release) => release.version === `v${pin}`),
  `Node.js ${pin} is not a published release`,
);
const lineReleases = releases.filter((release) =>
  release.version.startsWith(`v${major}.`),
);
assert(
  lineReleases.every((release) => typeof release.security === "boolean"),
  "Missing Node.js security release metadata",
);
const securityRelease = lineReleases
  .filter((release) => release.security)
  .sort((a, b) => compareVersions(b.version, a.version))[0];

const supported = new Date().toISOString().slice(0, 10) <= line.end;
const patched =
  !securityRelease || compareVersions(pin, securityRelease.version) >= 0;
const summary = [
  "## Node.js runtime audit",
  `- Pinned: ${pin}`,
  `- Latest security release in this release line: ${securityRelease?.version ?? "None published"}`,
  `- Support ends: ${line.end}`,
  `- Result: ${supported && patched ? "PASS" : "ACTION REQUIRED"}`,
  "",
].join("\n");
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
}
assert(supported, `Node.js ${major} is past end of support`);
assert(patched, `Upgrade Node.js to ${securityRelease?.version} or newer`);
