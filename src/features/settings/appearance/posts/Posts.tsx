import { IonLabel, IonList } from "@ionic/react";
import { ListHeader } from "../../shared/formatting";
import BlurNsfw from "./BlurNsfw";
import PostSize from "./PostSize";
import EmbedCrossposts from "./EmbedCrossposts";
import ShowCommunityIcons from "./ShowCommunityIcons";

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
        <ShowCommunityIcons />
      </IonList>
    </>
  );
}
