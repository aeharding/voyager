import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { IonItemSlidingCustomEvent, ItemSlidingCustomEvent } from "@ionic/core";
import {
  IonIcon,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
} from "@ionic/react";
import React, { useMemo, useRef, useState } from "react";
import IonIconNoStroke from "../../../helpers/ionIconNoStroke";

const StyledIonItemSliding = styled(IonItemSliding)`
  --ion-item-border-color: transparent;
`;

const OptionContainer = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  width: min(60px, 11vw);

  opacity: 0.5;

  ${({ active }) =>
    active &&
    css`
      opacity: 1;
    `}
`;

export type SlidingItemAction = {
  /**
   * If `string`, it's passed to IonIcon as an icon value
   */
  render: (() => React.ReactNode) | string;
  trigger: () => void;
  bgColor: string;
};

export interface SlidingItemProps {
  className?: string;
  startActions: [SlidingItemAction, SlidingItemAction] | [SlidingItemAction];
  endActions: [SlidingItemAction, SlidingItemAction] | [SlidingItemAction];
  children?: React.ReactNode;
}

const FIRST_ACTION_RATIO = 1;
const SECOND_ACTION_RATIO = 1.75;

export default function SlidingItem({
  startActions,
  endActions,
  className,
  children,
}: SlidingItemProps) {
  const dragRef = useRef<ItemSlidingCustomEvent | undefined>();
  const [ratio, setRatio] = useState(0);
  const [dragging, setDragging] = useState(false);

  async function onIonDrag(e: IonItemSlidingCustomEvent<unknown>) {
    dragRef.current = e;

    const ratio = await e.target.getSlidingRatio();

    if (Math.round(ratio) === ratio) return;

    setRatio(ratio);
    setDragging(true);
  }

  /*
   * Start Actions
   */

  const currentStartActionIndex = useMemo(() => {
    if (startActions.length === 1) return 0;

    return ratio <= -SECOND_ACTION_RATIO ? 1 : 0;
  }, [ratio, startActions.length]);

  const startActionColor = startActions[currentStartActionIndex]?.bgColor;

  const startActionContents = useMemo(() => {
    const render = startActions[currentStartActionIndex]?.render;

    if (!render) return;
    if (typeof render === "string") return <IonIcon icon={render} />;
    return render();

    // NOTE: This caches the content so that it doesn't re-render until completely closed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStartActionIndex, ratio]);

  /*
   * End Actions
   */

  const currentEndActionIndex = useMemo(() => {
    if (endActions.length === 1) return 0;

    return ratio >= SECOND_ACTION_RATIO ? 1 : 0;
  }, [ratio, endActions.length]);

  const endActionColor = endActions[currentEndActionIndex]?.bgColor;

  const endActionContents = useMemo(() => {
    const render = endActions[currentEndActionIndex]?.render;

    if (!render) return;
    if (typeof render === "string") return <IonIconNoStroke icon={render} />;
    return render();

    // NOTE: This caches the content so that it doesn't re-render until completely closed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEndActionIndex, ratio]);

  async function onDragStop() {
    if (!dragRef.current) return;
    if (!dragging) return;

    if (ratio <= -FIRST_ACTION_RATIO) {
      startActions[currentStartActionIndex]?.trigger();
    } else if (ratio >= FIRST_ACTION_RATIO) {
      endActions[currentEndActionIndex]?.trigger();
    }

    dragRef.current.target.closeOpened();
    setDragging(false);
  }

  return (
    <StyledIonItemSliding
      onIonDrag={onIonDrag}
      onTouchEnd={onDragStop}
      onMouseUp={onDragStop}
      className={className}
    >
      <IonItemOptions side="start">
        <IonItemOption color={startActionColor}>
          <OptionContainer active={ratio <= -FIRST_ACTION_RATIO}>
            {startActionContents}
          </OptionContainer>
        </IonItemOption>
      </IonItemOptions>

      <IonItemOptions side="end">
        <IonItemOption color={endActionColor}>
          <OptionContainer active={ratio >= FIRST_ACTION_RATIO}>
            {endActionContents}
          </OptionContainer>
        </IonItemOption>
      </IonItemOptions>
      {children}
    </StyledIonItemSliding>
  );
}
