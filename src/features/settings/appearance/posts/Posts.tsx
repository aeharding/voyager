import { IonLabel, IonList } from "@ionic/react";
import { ListHeader } from "../../shared/formatting";
import BlurNsfw from "./BlurNsfw";
import PostSize from "./PostSize";
import EmbedCrossposts from "./EmbedCrossposts";
import ShowCommunityIcons from "./ShowCommunityIcons";
import EmbedExternalMedia from "./EmbedExternalMedia";

export default function Posts() {
  return (
    <>
      <ListHeader>
        <IonLabel>Posts</IonLabel>
      </ListHeader>
      <IonList inset>
        <PostSize />
        <BlurNsfw />
        <EmbedCrossposts />
        <EmbedExternalMedia />
        <ShowCommunityIcons />
      </IonList>
    </>
  );
}
