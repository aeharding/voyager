import { IonLabel, IonList } from "@ionic/react";
import { ListHeader } from "./TextSize";
import { InsetIonItem } from "../../user/Profile";
import { useAppSelector } from "../../../store";
import { startCase } from "lodash";

export default function PostView() {
  const postsAppearanceType = useAppSelector(
    (state) => state.appearance.posts.type
  );

  return (
    <>
      <ListHeader>
        <IonLabel>Posts</IonLabel>
      </ListHeader>
      <IonList inset>
        <InsetIonItem routerLink="/settings/appearance/posts">
          <IonLabel>Post Size</IonLabel>
          <IonLabel slot="end" color="medium">
            {startCase(postsAppearanceType)}
          </IonLabel>
        </InsetIonItem>
      </IonList>
    </>
  );
}
