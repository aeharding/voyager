import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setDownvotedCollapsedByDefault } from "../../settingsSlice";

export default function DownvotedCollapsedByDefault() {
  const dispatch = useAppDispatch();
  const downvotedCollapsedByDefault = useAppSelector(
    (state) => state.settings.general.comments.downvotedCollapsedByDefault,
  );

  return (
    <IonItem>
      <IonToggle
        checked={downvotedCollapsedByDefault}
        onIonChange={(e) =>
          dispatch(setDownvotedCollapsedByDefault(e.detail.checked))
        }
      >
        Collapse Downvoted Comments
      </IonToggle>
    </IonItem>
  );
}
