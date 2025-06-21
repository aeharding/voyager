import { IonItem, IonLabel } from "@ionic/react";

import {
  formatPostSort,
  useSelectPostSort,
} from "#/features/feed/sort/PostSort";
import { useAppDispatch, useAppSelector } from "#/store";

import { setDefaultPostSort } from "../../settingsSlice";

export default function DefaultSort() {
  const dispatch = useAppDispatch();
  const defaultPostSort = useAppSelector(
    (state) => state.settings.general.posts.sort,
  );

  const present = useSelectPostSort(
    (newSort) => {
      dispatch(setDefaultPostSort(newSort));
    },
    { title: "Default Posts Sort..." },
  );

  return (
    <IonItem button onClick={() => present(defaultPostSort)} detail={false}>
      <IonLabel className="ion-text-nowrap">Default Sort</IonLabel>
      <IonLabel slot="end" color="medium" className="ion-no-margin">
        {formatPostSort(defaultPostSort)}
      </IonLabel>
    </IonItem>
  );
}
