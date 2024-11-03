import { pickBy, without } from "lodash";

import { getAllObjectValuesDeep } from "#/helpers/object";
import { db } from "#/services/db";

import { LOCALSTORAGE_KEYS, get, set } from "../../../syncStorage";

const BASE_BACKUP_JSON = {
  voyagerBackupVersion: 1,
  voyagerAppVersion: APP_VERSION,
} as const;

type Backup = typeof BASE_BACKUP_JSON & {
  created: string;

  dexie: unknown;
  localStorage: Record<string, unknown>;
};

export function isBackup(potentialBackup: unknown): potentialBackup is Backup {
  if (!potentialBackup || typeof potentialBackup !== "object") return false;
  if (!("voyagerBackupVersion" in potentialBackup)) return false;

  // TODO - if backup version changes, it should be handled
  // Right now, just support v1
  if (
    potentialBackup.voyagerBackupVersion !==
    BASE_BACKUP_JSON.voyagerBackupVersion
  )
    return false;

  return true;
}

export async function createBackup(): Promise<Backup> {
  const dexieBlob = await db.export({
    skipTables: getSkipTables(),
  });

  const dexieExport = JSON.parse(await dexieBlob.text());

  return {
    ...BASE_BACKUP_JSON,
    created: new Date().toISOString(),
    dexie: dexieExport,
    localStorage: pickBy(
      // pickBy: remove null/undefined
      Object.assign(
        {},
        ...getAllObjectValuesDeep(LOCALSTORAGE_KEYS).map((key) => ({
          [key]: get(key),
        })),
      ),
      (p) => p != null,
    ),
  };
}

export async function restoreFromBackup(backup: Backup) {
  await db.import(new Blob([JSON.stringify(backup.dexie)]), {
    clearTablesBeforeImport: true,
    skipTables: getSkipTables(),
  });

  // Clear existing values of localStorage keys eligible for backup
  getAllObjectValuesDeep(LOCALSTORAGE_KEYS).forEach((key) =>
    localStorage.removeItem(key),
  );

  Object.entries(backup.localStorage).forEach(([key, value]) => {
    set(key, value);
  });
}

function getSkipTables() {
  return without(
    db.tables.map((t) => t.name),
    "settings",
  );
}
