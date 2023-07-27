import { IonList } from "@ionic/react";
import DisableMarkingRead from "./DisableMarkingRead";
import MarkReadOnScroll from "./MarkReadOnScroll";
import { useAppSelector } from "../../../../store";
import ShowHideReadButton from "./ShowHideReadButton";

export default function HidingSettings() {
  const disableMarkingRead = useAppSelector(
    (state) => state.settings.general.posts.disableMarkingRead
  );

  return (
    <>
      <IonList inset>
        <DisableMarkingRead />
        {!disableMarkingRead && (
          <>
            <MarkReadOnScroll />
            <ShowHideReadButton />
          </>
        )}
      </IonList>
    </>
  );
}
