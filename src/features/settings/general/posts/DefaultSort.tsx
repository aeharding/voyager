import { useAppDispatch, useAppSelector } from "../../../../store";
import { setDefaultPostSort } from "../../settingsSlice";
import {
  formatTopLabel,
  isTopSort,
  useSelectPostSort,
} from "../../../feed/PostSort";
import { IonItem, IonLabel } from "@ionic/react";
import { SortType } from "lemmy-js-client";
import { startCase } from "lodash";

export default function DefaultSort() {
  const dispatch = useAppDispatch();
  const defaultPostSort = useAppSelector(
    (state) => state.settings.general.posts.sort,
  );

  const present = useSelectPostSort((newSort) => {
    dispatch(setDefaultPostSort(newSort));
  });

  return (
    <IonItem button onClick={() => present(defaultPostSort)} detail={false}>
      <IonLabel className="ion-text-nowrap">Default Sort</IonLabel>
      <IonLabel slot="end" color="medium" className="ion-no-margin">
        {formatPostSort(defaultPostSort)}
      </IonLabel>
    </IonItem>
  );
}

function formatPostSort(sort: SortType): string {
  if (isTopSort(sort)) return `Top: ${formatTopLabel(sort)}`;

  return startCase(sort);
}
