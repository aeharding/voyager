import {
  ActionSheetButton,
  IonActionSheetCustomEvent,
  OverlayEventDetail,
} from "@ionic/core";
import { IonActionSheet, IonLabel } from "@ionic/react";
import { startCase } from "lodash";
import React, { useState } from "react";
import { Dispatchable, useAppDispatch } from "../../../store";
import { InsetIonItem } from "./formatting";
import styled from "@emotion/styled";
import { css } from "@emotion/react";

export const Container = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
  min-width: 0;
`;

const TitleIonLabel = styled(IonLabel)`
  flex: 1;

  white-space: nowrap;
  min-width: 0;
  overflow: hidden;
`;

export const ValueLabel = styled(IonLabel)`
  flex: 0 auto !important;
  text-align: right;

  min-width: 75px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export interface SettingSelectorProps<T, O extends Record<string, T>> {
  title: string;
  openTitle?: string;
  selected: T;
  setSelected: Dispatchable<T>;
  options: O;
  optionIcons?: Record<string | number, string>;
  icon?: React.FunctionComponent;
  iconMirrored?: boolean;
  disabled?: boolean;
  getOptionLabel?: (option: T) => string | undefined;
  getSelectedLabel?: (option: T) => string | undefined;
}

export default function SettingSelector<
  T extends string | number,
  O extends Record<string, T>,
>({
  title,
  openTitle,
  selected,
  setSelected,
  options,
  optionIcons,
  icon,
  iconMirrored,
  disabled,
  getOptionLabel,
  getSelectedLabel,
}: SettingSelectorProps<T, O>) {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const buttons: ActionSheetButton<T>[] = Object.values(options).map(
    function (v) {
      const customLabel = getOptionLabel?.(v);

      return {
        icon: optionIcons ? optionIcons[v] : undefined,
        text: customLabel ?? (typeof v === "string" ? startCase(v) : v),
        data: v,
        role: selected === v ? "selected" : undefined,
      } as ActionSheetButton<T>;
    },
  );

  const Icon = icon
    ? styled(icon, { shouldForwardProp: (prop) => prop !== "mirror" })<{
        mirror?: boolean;
      }>`
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
      <Container>
        {Icon && <Icon mirror={iconMirrored} />}
        <TitleIonLabel>{title}</TitleIonLabel>
        <ValueLabel slot="end" color="medium">
          {getSelectedLabel?.(selected) ??
            (typeof selected === "string" ? startCase(selected) : selected)}
        </ValueLabel>
      </Container>
      <IonActionSheet
        cssClass="left-align-buttons"
        isOpen={open}
        onDidDismiss={() => setOpen(false)}
        onWillDismiss={(
          e: IonActionSheetCustomEvent<OverlayEventDetail<T>>,
        ) => {
          if (e.detail.data == null) return;

          dispatch(setSelected(e.detail.data));
        }}
        header={openTitle ?? title}
        buttons={buttons}
      />
    </InsetIonItem>
  );
}
