import { IonButton, IonIcon } from "@ionic/react";
import { albumsOutline, chatboxOutline } from "ionicons/icons";

import useLemmyUrlHandler, {
  ObjectType,
} from "#/features/shared/useLemmyUrlHandler";
import { openInBrowser } from "#/helpers/browser";
import { getPlatform } from "#/helpers/device";

interface SourceUrlButtonProps extends React.ComponentPropsWithoutRef<
  typeof IonButton
> {
  sourceUrl: string | undefined;
  dismiss: () => void;
}

export default function SourceUrlButton({
  sourceUrl,
  dismiss,
  ...rest
}: SourceUrlButtonProps) {
  const { redirectToLemmyObjectIfNeeded, determineObjectTypeFromUrl } =
    useLemmyUrlHandler();

  if (!sourceUrl) return;

  const type = determineObjectTypeFromUrl(sourceUrl);
  const icon = determineIcon(type);

  if (!icon) return;

  return (
    <IonButton
      {...rest}
      aria-label="Open source link"
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={async (e) => {
        e.stopPropagation();

        if (e.metaKey || e.ctrlKey) return;

        // target="_blank" is a no-op in the Tauri webview
        if (getPlatform() === "tauri") e.preventDefault();

        const result = await redirectToLemmyObjectIfNeeded(sourceUrl, e);

        if (result !== "success") {
          if (getPlatform() === "tauri") openInBrowser(sourceUrl);
          return;
        }

        dismiss();
        return false;
      }}
    >
      <IonIcon icon={icon} slot="icon-only" />
    </IonButton>
  );
}

function determineIcon(type: ObjectType | undefined) {
  switch (type) {
    case "post":
      return albumsOutline;
    case "comment":
      return chatboxOutline;
  }
}
