import { IonLabel, IonList } from "@ionic/react";
import { ListHeader } from "../../shared/formatting";
import BlurNsfw from "./BlurNsfw";
import PostSize from "./PostSize";
import EmbedCrossposts from "./EmbedCrossposts";
import ShowCommunityIcons from "./ShowCommunityIcons";
import EmbedExternalMedia from "./EmbedExternalMedia";
import AlwaysShowAuthor from "./AlwaysShowAuthor";
import RememberType from "./RememberType";
import CommunityAtTop from "./CommunityAtTop";
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
