import {
  ActionSheetButton,
  IonActionSheetCustomEvent,
  OverlayEventDetail,
} from "@ionic/core";
import { IonActionSheet, IonLabel } from "@ionic/react";
import { Dictionary, startCase } from "lodash";
import React, { useState } from "react";
import { Dispatchable, useAppDispatch } from "../../../store";
import { InsetIonItem } from "./formatting";
import styled from "@emotion/styled";
import { css } from "@emotion/react";

export interface SettingSelectorProps<T> {
  title: string;
  selected: T;
  setSelected: Dispatchable<T>;
  options: Dictionary<string>;
  optionIcons?: Dictionary<string>;
  icon?: React.FunctionComponent;
  iconMirrored?: boolean;
  disabled?: boolean;
}

export default function SettingSelector<T extends string>({
  title,
  selected,
  setSelected,
  options,
  optionIcons,
  icon,
  iconMirrored,
  disabled,
}: SettingSelectorProps<T>) {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const buttons: ActionSheetButton<T>[] = Object.values(options).map(function (
    v
  ) {
    return {
      icon: optionIcons ? optionIcons[v] : undefined,
      text: startCase(v),
      data: v,
      role: selected === v ? "selected" : undefined,
    } as ActionSheetButton<T>;
  });

  const Icon = icon
    ? styled(icon)<{ mirror?: boolean }>`
        position: relative;
        display: inline-flex;
        height: 4ex;
        width: auto;
        stroke: var(--ion-color-primary);
        fill: var(--ion-color-primary);

        ${({ mirror }) =>
          mirror
            ? css`
                padding-inline-start: 0.7em;
                transform: scaleX(-1);
              `
            : css`
                padding-inline-end: 0.7em;
              `}
      `
    : undefined;

  return (
    <InsetIonItem
      button
      onClick={() => setOpen(true)}
      disabled={disabled}
      detail={false}
    >
      {Icon && <Icon mirror={iconMirrored} />}
      <IonLabel>{title}</IonLabel>
      <IonLabel slot="end" color="medium">
        {startCase(selected)}
      </IonLabel>
      <IonActionSheet
        cssClass="left-align-buttons"
        isOpen={open}
        onDidDismiss={() => setOpen(false)}
        onWillDismiss={(
          e: IonActionSheetCustomEvent<OverlayEventDetail<T>>
        ) => {
          if (e.detail.data) {
            dispatch(setSelected(e.detail.data));
          }
        }}
        header={title}
        buttons={buttons}
      />
    </InsetIonItem>
  );
}
