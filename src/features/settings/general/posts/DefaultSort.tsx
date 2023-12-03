import { useAppDispatch, useAppSelector } from "../../../../store";
import { setDefaultPostSort } from "../../settingsSlice";
import {
  formatTopLabel,
  isTopSort,
  useSelectPostSort,
} from "../../../feed/PostSort";
import { InsetIonItem } from "../../shared/formatting";
import { Container, ValueLabel } from "../../shared/SettingSelector";
import { IonLabel } from "@ionic/react";
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
    <InsetIonItem
      button
      onClick={() => present(defaultPostSort)}
      detail={false}
    >
      <Container>
        <IonLabel>Default Post Sort</IonLabel>
        <ValueLabel slot="end" color="medium">
          {formatPostSort(defaultPostSort)}
        </ValueLabel>
      </Container>
    </InsetIonItem>
  );
}

function formatPostSort(sort: SortType): string {
  if (isTopSort(sort)) return formatTopLabel(sort);

  return startCase(sort);
}
