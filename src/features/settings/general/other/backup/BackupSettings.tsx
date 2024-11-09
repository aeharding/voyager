import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { IonItem, IonLabel, useIonActionSheet } from "@ionic/react";
import "dexie-export-import";

import { isAndroid, isNative } from "#/helpers/device";
import useAppToast from "#/helpers/useAppToast";

import { createBackup, isBackup, restoreFromBackup } from "./helpers";

export default function BackupSettings() {
  const [presentActionSheet] = useIonActionSheet();
  const [presentAddlActionSheet] = useIonActionSheet();
  const presentAlert = useAppToast();

  function clear() {
    presentActionSheet({
      header: "Backup and Restore Settings",
      subHeader: "Lemmy account settings and login sessions are not exported",
      buttons: [
        {
          text: "Backup",
          handler: () => {
            (async () => {
              const filename = `voyager-export-${Math.floor(Date.now() / 1_000)}.json`;

              const backup = await createBackup();

              // MARK - annoying platform specific logic to save the file

              if (isNative()) {
                if (isAndroid()) {
                  // IDK a good way to show a file save prompt in Android
                  await Filesystem.writeFile({
                    path: filename,
                    data: JSON.stringify(backup),
                    directory: Directory.Documents,
                    encoding: Encoding.UTF8,
                  });
                  presentAlert({
                    message: `${filename} saved to Documents`,
                  });
                } else {
                  const file = await Filesystem.writeFile({
                    path: filename,
                    data: JSON.stringify(backup),
                    directory: Directory.Cache,
                    encoding: Encoding.UTF8,
                  });
                  await Share.share({
                    files: [file.uri],
                  });
                  await Filesystem.deleteFile({ path: file.uri });
                }
              } else {
                const blob = new Blob([JSON.stringify(backup)]);
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

                      let data: unknown;

                      try {
                        data = JSON.parse(await file.text());
                      } catch (error) {
                        onRestoreFail();
                        throw error;
                      }

                      if (!isBackup(data)) {
                        onRestoreFail();
                        return;
                      }

                      await restoreFromBackup(data);

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
      <IonLabel color="primary">Backup and Restore Settings</IonLabel>
    </IonItem>
  );
}
