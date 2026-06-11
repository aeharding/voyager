import type { Page } from "@playwright/test";

/** Read all rows of a table in voyager's Dexie (IndexedDB) database. */
export async function readDbRows<T = unknown>(
  page: Page,
  table: string,
): Promise<T[]> {
  return page.evaluate(
    (tableName) =>
      new Promise<T[]>((resolve) => {
        const request = indexedDB.open("WefwefDB");
        request.onerror = () => resolve([]);
        request.onsuccess = () => {
          const db = request.result;
          try {
            const getAll = db
              .transaction(tableName)
              .objectStore(tableName)
              .getAll();
            getAll.onsuccess = () => {
              db.close();
              resolve(getAll.result);
            };
            getAll.onerror = () => {
              db.close();
              resolve([]);
            };
          } catch {
            // Table not created yet — treat as empty (callers poll)
            db.close();
            resolve([]);
          }
        };
      }),
    table,
  );
}

/** Persisted value of a setting (Dexie `settings` table), if any. */
export async function getSetting(page: Page, key: string): Promise<unknown> {
  const rows = await readDbRows<{ key: string; value: unknown }>(
    page,
    "settings",
  );

  return rows.find((row) => row.key === key)?.value;
}
