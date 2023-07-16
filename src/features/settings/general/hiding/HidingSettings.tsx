import { IonList } from "@ionic/react";
import DisableMarkingRead from "./DisableMarkingRead";
import MarkReadOnScroll from "./MarkReadOnScroll";
import { useAppSelector } from "../../../../store";

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
          </>
        )}
      </IonList>
    </>
  );
}
