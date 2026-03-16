/**
 * Fetches monthly active user counts for every Lemmy instance in
 * categories.json via the public /api/v3/site endpoint, then rewrites
 * categories.json with each category's instances sorted by activity
 * (highest first). Instances that fail to respond are prompted
 * interactively — enter a manual count or -1 to remove them from the list.
 *
 * Run via: pnpm script:update-instance-rankings
 */
import fs from "node:fs/promises";
import readline from "node:readline/promises";

import { mapValues, sortBy, uniq } from "es-toolkit";

const CATEGORIES_JSON_PATH = new URL(
  "../src/features/auth/login/data/categories.json",
  import.meta.url,
);

async function fetchMonthlyActiveUsers(host) {
  try {
    const res = await fetch(`https://${host}/api/v3/site`, {
      headers: { accept: "application/json" },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const { site_view } = await res.json();

    return Number(site_view?.counts?.users_active_month) || 0;
  } catch (e) {
    console.error(`Offline: ${host} (${e.message})`);

    return -1;
  }
}

const categories = JSON.parse(await fs.readFile(CATEGORIES_JSON_PATH, "utf8"));

const uniqueHosts = uniq(Object.values(categories).flat());
console.log(`Fetching stats for ${uniqueHosts.length} unique hosts...`);

const stats = await Promise.all(uniqueHosts.map(fetchMonthlyActiveUsers));
const statsByHost = new Map(uniqueHosts.map((host, i) => [host, stats[i]]));

const offline = uniqueHosts.filter((h) => statsByHost.get(h) === -1);

if (offline.length) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  console.log("\nCouldn't fetch stats. Enter users/month, or -1 to remove:\n");

  for (const host of offline) {
    const answer = await rl.question(`  https://${host}: `);
    statsByHost.set(host, Number(answer));
  }

  rl.close();
}

const removedHosts = new Set(
  [...statsByHost.entries()].filter(([, v]) => v === -1).map(([k]) => k),
);

const updated = mapValues(categories, (hosts) =>
  sortBy(
    hosts.filter((h) => !removedHosts.has(h)),
    [(h) => -(statsByHost.get(h) ?? 0)],
  ),
);

await fs.writeFile(
  CATEGORIES_JSON_PATH,
  `${JSON.stringify(updated, null, 2)}\n`,
);
console.log("\nWrote updated categories.json");
