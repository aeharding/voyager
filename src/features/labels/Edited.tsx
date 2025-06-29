import { useIonAlert } from "@ionic/react";
import { differenceInMinutes } from "date-fns";
import { pencil } from "ionicons/icons";
import { MouseEvent } from "react";
import { CommentView, PostView } from "threadiverse";

import Stat from "#/features/post/detail/Stat";
import { isPost } from "#/helpers/lemmy";

import { formatRelativeToNow } from "./Ago";

import styles from "./Edited.module.css";

interface EditedProps {
  item: PostView | CommentView;
  showDate?: true;
  className?: string;
}

export default function Edited({ item, showDate, className }: EditedProps) {
  const [present] = useIonAlert();

  const updated = isPost(item) ? item.post.updated : item.comment.updated;

  const created = new Date(item.counts.published);

  const edited = (() => {
    if (!updated) return;

    const edited = new Date(updated);

    // Don't show as edited if changed within 5 minutes of creation
    if (differenceInMinutes(edited, created) < 5) return;

    return edited;
  })();

  const editedLabelIfNeeded = (() => {
    if (!showDate) return;
    if (!edited) return;

    const editedLabel = formatRelativeToNow(edited);

    return editedLabel;
  })();

  if (!edited) return;

  function presentEdited(e: MouseEvent) {
    e.stopPropagation();

    if (!updated) return;

    const date = new Date(updated);

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
