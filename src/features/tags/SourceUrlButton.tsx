import { IonButton, IonIcon } from "@ionic/react";
import { albumsOutline, chatboxOutline } from "ionicons/icons";

import useLemmyUrlHandler, {
  ObjectType,
} from "#/features/shared/useLemmyUrlHandler";

interface SourceUrlButtonProps
  extends React.ComponentPropsWithoutRef<typeof IonButton> {
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
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={async (e) => {
        e.stopPropagation();

        if (e.metaKey || e.ctrlKey) return;

        const result = await redirectToLemmyObjectIfNeeded(sourceUrl, e);

        if (result !== "success") return;

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
