import { IonItem, IonLabel } from "@ionic/react";

import {
  formatPostSort,
  useSelectPostSort,
} from "#/features/feed/sort/PostSort";
import { formatMode, OPTIMISTIC_MODE, useMode } from "#/helpers/threadiverse";
import { useAppDispatch, useAppSelector } from "#/store";

import { setDefaultPostSort } from "../../settingsSlice";

export default function DefaultSort() {
  const dispatch = useAppDispatch();
  const defaultPostSort = useAppSelector(
    (state) => state.settings.general.posts.sort,
  );
  const mode = useMode();

  const modeLabel = mode ? formatMode(mode) : "";

  const present = useSelectPostSort(
    (newSort) => {
      if (!mode) return;

      dispatch(setDefaultPostSort({ mode, sort: newSort }));
    },
    { title: `Default ${modeLabel} Posts Sort...` },
  );

  return (
    <IonItem
      button
      onClick={() => mode && present(defaultPostSort[mode])}
      detail={false}
    >
      <IonLabel className="ion-text-nowrap">Default Sort</IonLabel>
      <IonLabel slot="end" color="medium" className="ion-no-margin">
        {formatPostSort(defaultPostSort[mode ?? OPTIMISTIC_MODE])}
      </IonLabel>
    </IonItem>
  );
}
