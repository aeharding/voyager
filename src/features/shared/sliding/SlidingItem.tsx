import { ImpactStyle } from "@capacitor/haptics";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { IonItemSlidingCustomEvent, ItemSlidingCustomEvent } from "@ionic/core";
import { IonItemOption, IonItemOptions, IonItemSliding } from "@ionic/react";
import React, {
  MouseEvent,
  TouchEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import useHapticFeedback from "../../../helpers/useHapticFeedback";
import { bounceAnimation } from "../animations";
import { useAppSelector } from "../../../store";
import { OLongSwipeTriggerPointType } from "../../../services/db";
import ActionContents from "./ActionContents";

const StyledIonItemSliding = styled(IonItemSliding)`
  overflow: initial; // sticky

  --ion-item-border-color: transparent;
`;

const StyledIonItemOption = styled(IonItemOption)`
  width: 100%;
  align-items: flex-end;

  // ensure subpixel rounding never causes background color to show through
  margin-bottom: 0.5px;
  margin-top: 0.5px;
`;

const OptionContainer = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  width: min(60px, 11vw);

  opacity: 0.5;

  position: sticky;
  top: 0;
  bottom: 0;

  .item-options-start & {
    margin-right: auto;
  }

  .item-options-end & {
    margin-left: auto;
  }

  ${({ active }) =>
    active &&
    css`
      opacity: 1;

      ${bounceAnimation}
    `}
`;

export type SlidingItemAction = {
  /**
   * If `string`, it's passed to IonIcon as an icon value
   */
  icon: string;
  trigger: (e: TouchEvent | MouseEvent) => void;
  bgColor: string;
  slash?: boolean;
};

export type ActionList = [
  // short swipe action
  SlidingItemAction | undefined,
  // long swipe action
  SlidingItemAction | undefined,
];

export interface SlidingItemProps {
  className?: string;
  startActions: ActionList;
  endActions: ActionList;
  children?: React.ReactNode;
}

const FIRST_ACTION_RATIO = 1;
const SECOND_ACTION_RATIO_NORMAL = 1.75;
const SECOND_ACTION_RATIO_LATER = 2.5;

function getActiveItem(
  ratio: number,
  startActions: ActionList,
  endActions: ActionList,
  SECOND_ACTION_RATIO: number,
) {
  const hasNearSwipe = !!(ratio < 0 ? startActions[0] : endActions[0]);
  const hasFarSwipe = !!(ratio < 0 ? startActions[1] : endActions[1]);

  if (ratio < 0) {
    if (ratio < -SECOND_ACTION_RATIO && hasFarSwipe) return -2;
    if (ratio < -FIRST_ACTION_RATIO && hasNearSwipe) return -1;
  }

  if (ratio > SECOND_ACTION_RATIO && hasFarSwipe) return 2;
  if (ratio > FIRST_ACTION_RATIO && hasNearSwipe) return 1;
  return 0;
}

export default function SlidingItem({
  startActions,
  endActions,
  className,
  children,
}: SlidingItemProps) {
  const dragRef = useRef<ItemSlidingCustomEvent | undefined>();
  const [activeItemIndex, setActiveItemIndex] = useState<0 | 1 | 2 | -1 | -2>(
    0,
  );
  const vibrate = useHapticFeedback();
  const draggingRef = useRef(false);
  const longSwipeTriggerPoint = useAppSelector(
    (state) => state.gesture.swipe.longSwipeTriggerPoint,
  );

  const SECOND_ACTION_RATIO = useMemo(() => {
    switch (longSwipeTriggerPoint) {
      case OLongSwipeTriggerPointType.Normal:
        return SECOND_ACTION_RATIO_NORMAL;
      case OLongSwipeTriggerPointType.Later:
        return SECOND_ACTION_RATIO_LATER;
    }
  }, [longSwipeTriggerPoint]);

  const activeActionRef = useRef(activeItemIndex);

  const onIonDrag = useCallback(
    async (e: IonItemSlidingCustomEvent<unknown>) => {
      dragRef.current = e;

      if (!draggingRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ratio = (e.detail as any).ratio;

      if (Math.round(ratio) === ratio) return;

      const activeItem = getActiveItem(
        ratio,
        startActions,
        endActions,
        SECOND_ACTION_RATIO,
      );

      setActiveItemIndex(activeItem);

      if (Math.abs(activeItem) > activeActionRef.current) {
        vibrate({ style: ImpactStyle.Light });
      }

      activeActionRef.current = Math.abs(activeItem) as 0 | 1 | 2;
    },
    [SECOND_ACTION_RATIO, endActions, startActions, vibrate],
  );

  /*
   * Start Actions
   */

  const canSwipeStart = useMemo(() => {
    return startActions[0] || startActions[1];
  }, [startActions]);
  const canSwipeEnd = useMemo(() => {
    return endActions[0] || endActions[1];
  }, [endActions]);

  const currentStartActionIndex = useMemo(() => {
    if (!startActions[1]) return 0;
    else if (!startActions[0]) return 1;
    else return activeItemIndex === -2 ? 1 : 0;
  }, [activeItemIndex, startActions]);

  const startActionContents = useMemo(
    () => <ActionContents action={startActions[currentStartActionIndex]} />,

    // NOTE: This caches the content so that it doesn't re-render until completely closed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeItemIndex],
  );

  /*
   * End Actions
   */

  const currentEndActionIndex = useMemo(() => {
    if (!endActions[1]) return 0;
    else if (!endActions[0]) return 1;
    else return activeItemIndex === 2 ? 1 : 0;
  }, [endActions, activeItemIndex]);

  const endActionContents = useMemo(
    () => <ActionContents action={endActions[currentEndActionIndex]} />,

    // NOTE: This caches the content so that it doesn't re-render until completely closed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeItemIndex],
  );

  const onDragStop = useCallback(
    async (e: TouchEvent | MouseEvent) => {
      if (!dragRef.current) return;
      if (!draggingRef.current) return;

      switch (activeItemIndex) {
        case 1:
        case 2:
          endActions[activeItemIndex - 1]?.trigger(e);
          break;
        case -1:
        case -2:
          startActions[-activeItemIndex - 1]?.trigger(e);
      }

      dragRef.current.target.closeOpened();
      draggingRef.current = false;
    },
    [endActions, activeItemIndex, startActions],
  );

  const onDragStart = useCallback(() => {
    draggingRef.current = true;

    setActiveItemIndex(0);
  }, []);

  const startItems = useMemo(() => {
    if (!canSwipeStart) return;

    const startActionColor = startActions[currentStartActionIndex]?.bgColor;

    return (
      <IonItemOptions side="start">
        <StyledIonItemOption color={startActionColor}>
          <OptionContainer active={activeItemIndex < 0} slot="top">
            {startActionContents}
          </OptionContainer>
        </StyledIonItemOption>
      </IonItemOptions>
    );
  }, [
    activeItemIndex,
    canSwipeStart,
    currentStartActionIndex,
    startActionContents,
    startActions,
  ]);

  const endItems = useMemo(() => {
    if (!canSwipeEnd) return;

    const endActionColor = endActions[currentEndActionIndex]?.bgColor;

    return (
      <IonItemOptions side="end">
        <StyledIonItemOption color={endActionColor}>
          <OptionContainer active={activeItemIndex > 0} slot="top">
            {endActionContents}
          </OptionContainer>
        </StyledIonItemOption>
      </IonItemOptions>
    );
  }, [
    activeItemIndex,
    canSwipeEnd,
    currentEndActionIndex,
    endActionContents,
    endActions,
  ]);

  const childrenMemoized = useMemo(() => children, [children]);

  return useMemo(() => {
    return (
      <StyledIonItemSliding
        onIonDrag={onIonDrag}
        onTouchStart={onDragStart}
        onMouseDown={onDragStart}
        onTouchEnd={onDragStop}
        onMouseUp={onDragStop}
        className={className}
      >
        {startItems}

        {endItems}

        {childrenMemoized}
      </StyledIonItemSliding>
    );
  }, [
    onIonDrag,
    onDragStart,
    onDragStop,
    className,
    startItems,
    endItems,
    childrenMemoized,
  ]);
}
