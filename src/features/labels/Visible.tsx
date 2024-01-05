import {
  Comment,
  CommentView,
  Community,
  Post,
  PostView,
} from "lemmy-js-client";
import { IonIcon, useIonAlert } from "@ionic/react";
import { warning } from "ionicons/icons";
import { MouseEvent, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { getItemActorName } from "../../helpers/lemmy";
import { getClient } from "../../services/lemmy";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: inherit;

  margin: -3px;
  padding: 3px;
`;

interface VisibleProps {
  item: PostView | CommentView;
  className?: string;
}

export default function Visible({ item, className }: VisibleProps) {
  const [visible, setVisible] = useState<boolean>();
  const [presentAlert] = useIonAlert();

  useEffect(() => {
    isVisibleInCommunity(
      "comment" in item ? item.comment : item.post,
      item.community,
    ).then(setVisible);
  }, [item]);

  async function isVisibleInCommunity(
    item: Post | Comment,
    community: Community,
  ) {
    const instance = getItemActorName(community);
    if (instance === new URL(item.ap_id).hostname) return true;

    const response = await getClient(instance).resolveObject({ q: item.ap_id });
    return "comment" in response || "post" in response;
  }

  function presentVisible(e: MouseEvent) {
    e.stopPropagation();

    if (visible) return;

    presentAlert({
      header: "Limited visibility",
      message: "This item is not yet visible in the community it was posted to",
      buttons: ["OK"],
    });
  }

  if (visible !== false) return;

  return (
    <Container onClick={presentVisible}>
      <IonIcon icon={warning} color="danger" className={className} />
    </Container>
  );
}
