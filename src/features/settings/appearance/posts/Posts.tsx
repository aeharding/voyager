import { IonLabel, IonList, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../user/Profile";
import { ListHeader } from "../../shared/formatting";
import BlurNsfw from "./BlurNsfw";
import PostSize from "./PostSize";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setBoldTitles } from "../../settingsSlice";

export default function Posts() {
  const dispatch = useAppDispatch();

  const { boldTitles } = useAppSelector((state) => state.settings.appearance.posts)

  return (
    <>
      <ListHeader>
        <IonLabel>Posts</IonLabel>
      </ListHeader>
      <IonList inset>
        <PostSize />
        <BlurNsfw />

        <InsetIonItem>
          <IonToggle
            checked={boldTitles}
            onIonChange={(e) =>
              dispatch(setBoldTitles(e.detail.checked ? true : false))
            }>
            Bold Titles
          </IonToggle>
        </InsetIonItem>
      </IonList>
    </>
  );
}
