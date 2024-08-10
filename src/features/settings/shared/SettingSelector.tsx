import {
  ActionSheetButton,
  IonActionSheetCustomEvent,
  OverlayEventDetail,
} from "@ionic/core";
import { IonActionSheet, IonItem, IonLabel } from "@ionic/react";
import { startCase } from "lodash";
import React, { useState } from "react";
import { Dispatchable, useAppDispatch } from "../../../store";
import { css, cx } from "@linaria/core";

const iconCss = css`
  position: relative;
  display: inline-flex;
  height: 40px;
  width: auto;
  stroke: var(--ion-color-primary);
  fill: var(--ion-color-primary);
`;

const iconMirrorCss = css`
  transform: scaleX(-1);
`;

export interface SettingSelectorProps<T, O extends Record<string, T>> {
  title: string;
  openTitle?: string;
  selected: T;
  setSelected: Dispatchable<T>;
  options: O;
  optionIcons?: Record<string | number, string>;
  icon?: React.FunctionComponent<{ className?: string; slot?: string }>;
  iconMirrored?: boolean;
  disabled?: boolean;
  getOptionLabel?: (option: T) => string | undefined;
  getSelectedLabel?: (option: T) => string | undefined;
  hideOptions?: T[] | undefined;
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
  icon: Icon,
  iconMirrored,
  disabled,
  getOptionLabel,
  getSelectedLabel,
  hideOptions = [],
}: SettingSelectorProps<T, O>) {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const buttons: ActionSheetButton<T>[] = Object.values(options)
    .filter((o) => !hideOptions.includes(o))
    .map((v) => ({
      icon: optionIcons ? optionIcons[v] : undefined,
      text:
        getOptionLabel?.(v) ?? (typeof v === "string" ? startCase(v) : `${v}`),
      data: v,
      role: selected === v ? "selected" : undefined,
    }));

  return (
    <IonItem
      button
      onClick={() => setOpen(true)}
      disabled={disabled}
      detail={false}
    >
      {Icon && (
        <Icon
          className={cx(iconCss, iconMirrored && iconMirrorCss)}
          slot="start"
        />
      )}
      <IonLabel className="ion-text-nowrap">{title}</IonLabel>
      <IonLabel slot="end" color="medium" className="ion-no-margin">
        {getSelectedLabel?.(selected) ??
          getOptionLabel?.(selected) ??
          (typeof selected === "string" ? startCase(selected) : selected)}
      </IonLabel>
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
    </IonItem>
  );
}
