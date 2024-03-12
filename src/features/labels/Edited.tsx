import { CommentView, PostView } from "lemmy-js-client";
import { IonIcon, useIonAlert } from "@ionic/react";
import { pencil } from "ionicons/icons";
import { MouseEvent, useMemo } from "react";
import { formatRelative } from "./Ago";
import { fixLemmyDateString } from "../../helpers/date";
import { styled } from "@linaria/react";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: inherit;

  margin: -3px;
  padding: 3px;
`;

interface EditedProps {
  item: PostView | CommentView;
  showDate?: true;
  className?: string;
}

export default function Edited({ item, showDate, className }: EditedProps) {
  const [present] = useIonAlert();

  const edited = "comment" in item ? item.comment.updated : item.post.updated;

  const editedLabelIfNeeded = useMemo(() => {
    if (!edited) return;
    if (!showDate) return;

    const createdLabel = formatRelative(item.counts.published);
    const editedLabel = formatRelative(edited);

    if (createdLabel === editedLabel) return;

    return editedLabel;
  }, [edited, item.counts.published, showDate]);

  if (!edited) return;

  function presentEdited(e: MouseEvent) {
    e.stopPropagation();

    if (!edited) return;

    const date = new Date(fixLemmyDateString(edited));

    present({
      header: `Edited ${formatRelative(edited)} Ago`,
      message: `Last edited on ${date.toDateString()} at ${date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`,
      buttons: ["OK"],
    });
  }

  return (
    <Container onClick={presentEdited}>
      <IonIcon icon={pencil} className={className} />
      {editedLabelIfNeeded}
    </Container>
  );
}
