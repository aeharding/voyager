import { IonLabel, IonList } from "@ionic/react";
import { ListHeader } from "../../shared/formatting";
import BlurNsfw from "./BlurNsfw";
import PostSize from "./PostSize";
import AvatarDisplay from "./AvatarDisplay";

export default function Posts() {
  return (
    <>
      <ListHeader>
        <IonLabel>Posts</IonLabel>
      </ListHeader>
      <IonList inset>
        <PostSize />
        <BlurNsfw />
        <AvatarDisplay />
      </IonList>
    </>
  );
}
