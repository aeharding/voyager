import { useAppSelector } from "../../store";
import { IonIcon } from "@ionic/react";
import { bookmark } from "ionicons/icons";
import { css } from "@emotion/react";

interface SaveProps {
  type: "comment" | "post";
  id: number;
  savedFromServer: boolean;
}

export default function Save({ type, id, savedFromServer }: SaveProps) {
  const savedById = useAppSelector((state) =>
    type === "comment"
      ? {}
      : // ? state.comment.commentSavedById
        state.post.postSavedById
  );

  const mySaved = savedById[id] ?? savedFromServer;

  return mySaved ? (
    <IonIcon
      icon={bookmark}
      css={css`
        color: var(--ion-color-success);
      `}
    />
  ) : null;
}
