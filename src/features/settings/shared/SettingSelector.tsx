import styled from "@emotion/styled";
import {
  ActionSheetButton,
  IonActionSheetCustomEvent,
  OverlayEventDetail,
} from "@ionic/core";
import { IonActionSheet, IonItem, IonLabel } from "@ionic/react";
import { Dictionary, startCase } from "lodash";
import { useState } from "react";
import { useAppDispatch } from "../../../store";

const InsetIonItem = styled(IonItem)`
  --background: var(--ion-tab-bar-background, var(--ion-color-step-50, #fff));
`;

export interface SettingSelectorProps<T> {
  title: string;
  selected: T;
  // eslint-disable-next-line @typescript-eslint/ban-types
  setSelected: Function;
  options: Dictionary<string>;
}

export default function SettingSelector<T extends string>({
  title,
  selected,
  setSelected,
  options,
}: SettingSelectorProps<T>) {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const buttons: ActionSheetButton<T>[] = Object.values(options).map(function (
    v
  ) {
    return {
      text: startCase(v),
      data: v,
    } as ActionSheetButton<T>;
  });

  return (
    <InsetIonItem button onClick={() => setOpen(true)}>
      <IonLabel>{title}</IonLabel>
      <IonLabel slot="end" color="medium">
        {startCase(selected)}
      </IonLabel>
      <IonActionSheet
        cssClass="left-align-buttons"
        isOpen={open}
        onDidDismiss={() => setOpen(false)}
        onWillDismiss={(e: IonActionSheetCustomEvent<OverlayEventDetail>) => {
          if (e.detail.data) {
            dispatch(setSelected(e.detail.data));
          }
        }}
        header={title}
        buttons={buttons.map((b) => ({
          ...b,
          role: selected === b.data ? "selected" : undefined,
        }))}
      />
    </InsetIonItem>
  );
}
