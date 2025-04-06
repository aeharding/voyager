import { useIonAlert } from "@ionic/react";
import { pencil } from "ionicons/icons";
import { CommentView, PostView } from "lemmy-js-client";
import { MouseEvent } from "react";

import Stat from "#/features/post/detail/Stat";

import { formatRelativeToNow } from "./Ago";

import styles from "./Edited.module.css";

interface EditedProps {
  item: PostView | CommentView;
  showDate?: true;
  className?: string;
}

export default function Edited({ item, showDate, className }: EditedProps) {
  const [present] = useIonAlert();

  const edited = "comment" in item ? item.comment.updated : item.post.updated;

  const editedLabelIfNeeded = (() => {
    if (!edited) return;
    if (!showDate) return;

    const createdLabel = formatRelativeToNow(new Date(item.counts.published));
    const editedLabel = formatRelativeToNow(new Date(edited));

    if (createdLabel === editedLabel) return;

    return editedLabel;
  })();

  if (!edited) return;

  function presentEdited(e: MouseEvent) {
    e.stopPropagation();

    if (!edited) return;

    const date = new Date(edited);

    present({
      header: `Edited ${formatRelativeToNow(date)} Ago`,
      message: `Last edited on ${date.toDateString()} at ${date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`,
      buttons: ["OK"],
    });
  }

  return (
    <Stat
      className={styles.edited}
      button
      onClick={presentEdited}
      icon={pencil}
      iconClassName={className}
    >
      {editedLabelIfNeeded}
    </Stat>
  );
}
