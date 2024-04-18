import { IonItem, IonLabel, useIonActionSheet } from "@ionic/react";
import { db } from "../../../../services/db";

import "dexie-export-import";
import { pickBy, without } from "lodash";
import { LOCALSTORAGE_KEYS } from "../../settingsSlice";
import { get, set } from "../../storage";
import { isAndroid, isNative } from "../../../../helpers/device";
import { Share } from "@capacitor/share";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import useAppToast from "../../../../helpers/useAppToast";

const BASE_BACKUP_JSON = {
  voyagerBackupVersion: "2024-04",
} as const;

type Backup = typeof BASE_BACKUP_JSON & {
  dexie: unknown;
  localStorage: Record<string, unknown>;
};

export default function BackupSettings() {
  const [presentActionSheet] = useIonActionSheet();
  const [presentAddlActionSheet] = useIonActionSheet();
  const presentAlert = useAppToast();

  function clear() {
    const skipTables = without(
      db.tables.map((t) => t.name),
      "settings",
    );

    presentActionSheet({
      header: "Backup and Restore Settings",
      subHeader: "Lemmy account settings and login sessions are not exported",
      buttons: [
        {
          text: "Backup",
          handler: () => {
            (async () => {
              const dexieBlob = await db.export({
                skipTables,
              });

              const dexieExport = JSON.parse(await dexieBlob.text());

              const exported = {
                ...BASE_BACKUP_JSON,
                dexie: dexieExport,
                localStorage: pickBy(
                  // pickBy: remove null/undefined
                  Object.assign(
                    {},
                    ...getAllObjectValues(LOCALSTORAGE_KEYS).map((key) => ({
                      [key]: get(key),
                    })),
                  ),
                  (p) => p != null,
                ),
              };

              const filename = `voyager-export-${Math.floor(Date.now() / 1_000)}.json`;

              if (isNative()) {
                if (isAndroid()) {
                  await Filesystem.writeFile({
                    path: filename,
                    data: JSON.stringify(exported),
                    directory: Directory.Documents,
                    encoding: Encoding.UTF8,
                  });
                  presentAlert({
                    message: `${filename} saved to Documents`,
                  });
                } else {
                  const file = await Filesystem.writeFile({
                    path: filename,
                    data: JSON.stringify(exported),
                    directory: Directory.Cache,
                    encoding: Encoding.UTF8,
                  });
                  await Share.share({
                    files: [file.uri],
                  });
                  await Filesystem.deleteFile({ path: file.uri });
                }
              } else {
                const blob = new Blob([JSON.stringify(exported)]);
                const link = document.createElement("a");
                link.download = filename;
                const href = URL.createObjectURL(blob);
                link.href = href;
                link.click();
                URL.revokeObjectURL(href);
              }
            })();
          },
        },
        {
          text: "Restore",
          handler: () => {
            presentAddlActionSheet({
              header: "Are you sure?",
              subHeader: "Import will overwrite any existing app settings",
              buttons: [
                {
                  text: "Select File",
                  role: "destructive",
                  handler: () => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "application/json";

                    input.onchange = async () => {
                      const file = input.files?.[0];

                      if (!file) {
                        presentAlert({
                          message: "No file provided",
                          color: "danger",
                        });
                        return;
                      }

                      let data: Backup;

                      try {
                        data = JSON.parse(await file.text());
                      } catch (error) {
                        onRestoreFail();
                        throw error;
                      }

                      if (
                        data["voyagerBackupVersion"] !==
                        BASE_BACKUP_JSON.voyagerBackupVersion
                      ) {
                        // TODO - if backup version changes, it should be handled
                        onRestoreFail();
                        return;
                      }

                      await db.import(new Blob([JSON.stringify(data.dexie)]), {
                        clearTablesBeforeImport: true,
                        skipTables,
                      });

                      // Clear existing values of localStorage keys eligible for backup
                      getAllObjectValues(LOCALSTORAGE_KEYS).forEach((key) =>
                        localStorage.removeItem(key),
                      );

                      Object.entries(data.localStorage).forEach(
                        ([key, value]) => {
                          set(key, value);
                        },
                      );

                      presentAlert({
                        message: "Import complete. Reloading...",
                      });

                      setTimeout(() => location.reload(), 2_000);
                    };

                    input.click();
                  },
                },
                {
                  text: "Cancel",
                },
              ],
            });
          },
        },
        {
          text: "Cancel",
        },
      ],
    });
  }

  function onRestoreFail() {
    presentAlert({
      message: "Voyager backup file malformed",
      color: "danger",
    });
  }

  return (
    <IonItem button onClick={clear} detail={false}>
      <IonLabel color="primary">Backup Settings</IonLabel>
    </IonItem>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAllObjectValues(obj: any): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values: any[] = [];

  // Helper function to recursively traverse the object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function traverse(obj: any) {
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        const value = obj[key];
        if (typeof value === "object" && value !== null) {
          traverse(value); // Recursively traverse nested objects
        } else {
          values.push(value); // Add non-object values to the result array
        }
      }
    }
  }

  traverse(obj);
  return values;
}
