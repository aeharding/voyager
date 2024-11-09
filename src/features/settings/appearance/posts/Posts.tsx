import { IonLabel, IonList } from "@ionic/react";

import { ListHeader } from "#/features/settings/shared/formatting";

import AlwaysShowAuthor from "./AlwaysShowAuthor";
import BlurNsfw from "./BlurNsfw";
import CommunityAtTop from "./CommunityAtTop";
import EmbedCrossposts from "./EmbedCrossposts";
import EmbedExternalMedia from "./EmbedExternalMedia";
import PostSize from "./PostSize";
import RememberType from "./RememberType";
import ShowCommunityIcons from "./ShowCommunityIcons";
import SubscribedIcon from "./SubscribedIcon";

export default function Posts() {
  return (
    <>
      <ListHeader>
        <IonLabel>Posts</IonLabel>
      </ListHeader>
      <IonList inset>
        <PostSize />
        <RememberType />
        <BlurNsfw />
        <CommunityAtTop />
        <EmbedExternalMedia />
        <ShowCommunityIcons />
        <SubscribedIcon />
        <AlwaysShowAuthor />
        <EmbedCrossposts />
      </IonList>
    </>
  );
}
