import { IonButton, IonIcon } from "@ionic/react";
import { noop } from "es-toolkit";
import { checkmark, ellipsisVertical, removeCircle } from "ionicons/icons";
import React, { createContext, useContext, useRef, useState } from "react";

import { isIosTheme } from "#/helpers/device";

import styles from "./ListEditor.module.css";

export function ListEditorProvider({ children }: React.PropsWithChildren) {
  const [editing, setEditing] = useState(false);

  return (
    <ListEditorContext value={{ editing, setEditing }}>
      {children}
    </ListEditorContext>
  );
}

interface ListEditorContextValue {
  editing: boolean;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ListEditorContext = createContext<ListEditorContextValue>({
  editing: false,
  setEditing: noop,
});

export function ListEditButton() {
  const { editing, setEditing } = useContext(ListEditorContext);

  return (
    <IonButton
      onClick={(e) => {
        setEditing((editing) => {
          if (e.target instanceof HTMLElement) {
            e.target
              .closest(".ion-page")
              ?.querySelectorAll("ion-list")
              .forEach((l) => l.closeSlidingItems());
          }

          return !editing;
        });
      }}
    >
      {(() => {
        if (isIosTheme()) {
          if (!editing) return "Edit";
          return "Done";
        }

        return <IonIcon icon={!editing ? ellipsisVertical : checkmark} />;
      })()}
    </IonButton>
  );
}

export function RemoveItemButton() {
  const { editing } = useContext(ListEditorContext);
  const ref = useRef<HTMLIonButtonElement>(null);

  if (!editing) return;

  return (
    <IonButton
      color="none"
      slot="start"
      ref={ref}
      onClick={(e) => {
        if (!(e.target instanceof HTMLElement)) return;

        const slider = e.target.closest("ion-item-sliding");
        if (!slider) return;

        slider.open("end");
      }}
    >
      <IonIcon
        icon={removeCircle}
        color="danger"
        slot="icon-only"
        className={styles.removeIcon}
      />
    </IonButton>
  );
}
