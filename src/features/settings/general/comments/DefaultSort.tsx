import { IonItem, IonLabel } from "@ionic/react";

import {
  formatCommentSort,
  useSelectCommentSort,
} from "#/features/comment/CommentSort";
import { formatMode, OPTIMISTIC_MODE, useMode } from "#/helpers/threadiverse";
import { useAppDispatch, useAppSelector } from "#/store";

import { setDefaultCommentSort } from "../../settingsSlice";

export default function DefaultSort() {
  const dispatch = useAppDispatch();
  const defaultCommentSort = useAppSelector(
    (state) => state.settings.general.comments.sort,
  );
  const mode = useMode();

  const modeLabel = mode ? formatMode(mode) : "";

  const present = useSelectCommentSort(
    (newSort) => {
      if (!mode) return;

      dispatch(setDefaultCommentSort({ mode, sort: newSort }));
    },
    { title: `Default ${modeLabel} Comments Sort...` },
  );

  return (
    <IonItem
      button
      onClick={() => mode && present(defaultCommentSort[mode])}
      detail={false}
    >
      <IonLabel className="ion-text-nowrap">Default Sort</IonLabel>
      <IonLabel slot="end" color="medium" className="ion-no-margin">
        {formatCommentSort(defaultCommentSort[mode ?? OPTIMISTIC_MODE])}
      </IonLabel>
    </IonItem>
  );
}
