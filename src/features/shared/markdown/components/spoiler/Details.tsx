import { IonAccordion, IonAccordionGroup, IonItem } from "@ionic/react";
import { noop } from "es-toolkit";
import React, {
  ComponentProps,
  createContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ExtraProps } from "react-markdown";

import store, { useAppDispatch } from "#/store";

import { getSpoilerId, updateSpoilerState } from "./spoilerSlice";

import styles from "./Details.module.css";

type DetailsProps = React.JSX.IntrinsicElements["details"] &
  ExtraProps & {
    id: string;
  };

export default function Details({ children, node, id }: DetailsProps) {
  const accordionGroupRef = useRef<HTMLIonAccordionGroupElement>(null);
  const [label, setLabel] = useState<React.ReactNode | undefined>();
  const dispatch = useAppDispatch();

  useLayoutEffect(() => {
    const accordionGroup = accordionGroupRef.current;
    if (!accordionGroup) return;

    const isOpen = store.getState().spoiler.byId[getSpoilerId(id, node)];

    accordionGroup.value = isOpen ? "open" : undefined;
  }, [id, node]);

  const onChange: NonNullable<
    ComponentProps<typeof IonAccordionGroup>["onIonChange"]
  > = (e) => {
    dispatch(
      updateSpoilerState({
        id: getSpoilerId(id, node),
        isOpen: e.detail.value === "open",
      }),
    );
  };

  return (
    <SpoilerContext value={{ setLabel }}>
      <IonAccordionGroup
        className={styles.accordionGroup}
        ref={accordionGroupRef}
        onIonChange={onChange}
      >
        <IonAccordion className={styles.accordion} value="open">
          <IonItem
            className={styles.headerItem}
            slot="header"
            onClick={(e) => e.stopPropagation()}
          >
            <div>{label}</div>
          </IonItem>
          <div slot="content" className="collapse-md-margins">
            {children}
          </div>
        </IonAccordion>
      </IonAccordionGroup>
    </SpoilerContext>
  );
}

interface SpoilerContextValue {
  setLabel: (label: React.ReactNode) => void;
}

export const SpoilerContext = createContext<SpoilerContextValue>({
  setLabel: noop,
});
