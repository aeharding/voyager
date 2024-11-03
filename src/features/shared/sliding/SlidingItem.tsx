import { ImpactStyle } from "@capacitor/haptics";
import { IonItemSlidingCustomEvent, ItemSlidingCustomEvent } from "@ionic/core";
import { IonItemOption, IonItemOptions, IonItemSliding } from "@ionic/react";
import { css } from "@linaria/core";
import { styled } from "@linaria/react";
import React, {
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useRef,
  useState,
} from "react";

import useHapticFeedback from "#/helpers/useHapticFeedback";
import { OLongSwipeTriggerPointType } from "#/services/db";
import { useAppSelector } from "#/store";

import { bounceAnimation } from "../animations";
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

const OptionContainer = styled.div`
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
`;

const optionContainerActiveCss = css`
  opacity: 1;

  ${bounceAnimation}
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

  const SECOND_ACTION_RATIO = (() => {
    switch (longSwipeTriggerPoint) {
      case OLongSwipeTriggerPointType.Normal:
        return SECOND_ACTION_RATIO_NORMAL;
      case OLongSwipeTriggerPointType.Later:
        return SECOND_ACTION_RATIO_LATER;
    }
  })();

  const activeActionRef = useRef(activeItemIndex);

  const onIonDrag = async (e: IonItemSlidingCustomEvent<unknown>) => {
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
  };

  /*
   * Start Actions
   */

  const canSwipeStart = startActions[0] || startActions[1];
  const canSwipeEnd = endActions[0] || endActions[1];

  const currentStartActionIndex = (() => {
    if (!startActions[1]) return 0;
    else if (!startActions[0]) return 1;
    else return activeItemIndex === -2 ? 1 : 0;
  })();

  const [startAction, setStartAction] = useState(
    startActions[currentStartActionIndex],
  );

  const currentStartActionIndexRef = useRef(currentStartActionIndex);

  useEffect(() => {
    currentStartActionIndexRef.current = currentStartActionIndex;
  });

  const startActionsRef = useRef(startActions);

  useEffect(() => {
    startActionsRef.current = startActions;
  });

  useEffect(() => {
    setStartAction(startActionsRef.current[currentStartActionIndexRef.current]);
  }, [activeItemIndex]);

  /*
   * End Actions
   */

  const currentEndActionIndex = (() => {
    if (!endActions[1]) return 0;
    else if (!endActions[0]) return 1;
    else return activeItemIndex === 2 ? 1 : 0;
  })();

  const [endAction, setEndAction] = useState(endActions[currentEndActionIndex]);

  const currentEndActionIndexRef = useRef(currentEndActionIndex);

  useEffect(() => {
    currentEndActionIndexRef.current = currentEndActionIndex;
  });

  const endActionsRef = useRef(endActions);

  useEffect(() => {
    endActionsRef.current = endActions;
  });

  useEffect(() => {
    setEndAction(endActionsRef.current[currentEndActionIndexRef.current]);
  }, [activeItemIndex]);

  const onDragStopEvent = useEffectEvent(async (e: TouchEvent | MouseEvent) => {
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
  });

  const onDragStart = () => {
    draggingRef.current = true;

    setActiveItemIndex(0);

    const onStop = (e: MouseEvent | TouchEvent) => {
      cleanup();
      onDragStopEvent(e);
    };

    const cleanup = () => {
      document.removeEventListener("mouseup", onStop);
      document.removeEventListener("touchend", onStop);
    };

    document.addEventListener("mouseup", onDragStopEvent);
    document.addEventListener("touchend", onDragStopEvent);

    return cleanup;
  };

  const startItems = (() => {
    if (!canSwipeStart) return;

    const startActionColor = startActions[currentStartActionIndex]?.bgColor;

    return (
      <IonItemOptions side="start">
        <StyledIonItemOption color={startActionColor}>
          <OptionContainer
            className={
              activeItemIndex < 0 ? optionContainerActiveCss : undefined
            }
            slot="top"
          >
            <ActionContents action={startAction} />
          </OptionContainer>
        </StyledIonItemOption>
      </IonItemOptions>
    );
  })();

  const endItems = (() => {
    if (!canSwipeEnd) return;

    const endActionColor = endActions[currentEndActionIndex]?.bgColor;

    return (
      <IonItemOptions side="end">
        <StyledIonItemOption color={endActionColor}>
          <OptionContainer
            className={
              activeItemIndex > 0 ? optionContainerActiveCss : undefined
            }
            slot="top"
          >
            <ActionContents action={endAction} />
          </OptionContainer>
        </StyledIonItemOption>
      </IonItemOptions>
    );
  })();

  return (
    <StyledIonItemSliding
      onIonDrag={onIonDrag}
      onTouchStart={onDragStart}
      onMouseDown={onDragStart}
      className={className}
    >
      {startItems}

      {endItems}

      {children}
    </StyledIonItemSliding>
  );
}
