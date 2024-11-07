import { IonButton, IonIcon } from "@ionic/react";
import { albumsOutline, chatboxOutline } from "ionicons/icons";

import useLemmyUrlHandler, {
  COMMENT_PATH,
  POST_PATH,
} from "#/features/shared/useLemmyUrlHandler";
import { getPathname } from "#/helpers/url";

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
  const { redirectToLemmyObjectIfNeeded } = useLemmyUrlHandler();

  if (!sourceUrl) return;

  const icon = determineIcon(determineType(sourceUrl));

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

function determineType(sourceUrl: string) {
  const pathname = getPathname(sourceUrl);
  if (!pathname) return;

  if (POST_PATH.test(pathname)) return "post";
  if (COMMENT_PATH.test(pathname)) return "comment";
}

function determineIcon(type: ReturnType<typeof determineType>) {
  switch (type) {
    case "post":
      return albumsOutline;
    case "comment":
      return chatboxOutline;
  }
}
