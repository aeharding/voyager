import { ImpactStyle } from "@capacitor/haptics";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { IonItemSlidingCustomEvent, ItemSlidingCustomEvent } from "@ionic/core";
import {
  IonIcon,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
} from "@ionic/react";
import { bookmark, mailUnread } from "ionicons/icons";
import React, {
  MouseEvent,
  TouchEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import useHapticFeedback from "../../../helpers/useHapticFeedback";
import { bounceAnimation } from "../animations";
import { useAppSelector } from "../../../store";
import { OLongSwipeTriggerPointType } from "../../../services/db";

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

const custom_slash_lengths: Record<string, number> = {
  [bookmark]: 35,
  [mailUnread]: 40,
};

const SlashedIcon = styled(IonIcon)<{
  icon: string;
  slash: boolean;
  bgColor: string;
}>`
  margin-block: 24px;

  color: white;

  ${({ icon, slash, bgColor }) =>
    slash &&
    css`
      &::after {
        content: "";
        position: absolute;
        height: ${custom_slash_lengths[icon] ?? 30}px;
        width: 3px;
        background: white;
        font-size: 1.7em;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        transform-origin: center;
        box-shadow: 0 0 0 2px var(--ion-color-${bgColor});
      }
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
  hasNearSwipe: boolean,
  hasFarSwipe: boolean,
  SECOND_ACTION_RATIO: number,
) {
  ratio = Math.abs(ratio);

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
  const [ratio, setRatio] = useState(0);
  const vibrate = useHapticFeedback();
  const [dragging, setDragging] = useState(false);
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

  const activeActionRef = useRef(0);

  async function onIonDrag(e: IonItemSlidingCustomEvent<unknown>) {
    dragRef.current = e;

    const ratio = await e.target.getSlidingRatio();

    if (Math.round(ratio) === ratio) return;

    setRatio(ratio);
    setDragging(true);

    const hasNearSwipe = !!(ratio < 0 ? startActions[0] : endActions[0]);
    const hasFarSwipe = !!(ratio < 0 ? startActions[1] : endActions[1]);

    const activeItem = getActiveItem(
      ratio,
      hasNearSwipe,
      hasFarSwipe,
      SECOND_ACTION_RATIO,
    );

    if (activeItem > activeActionRef.current) {
      vibrate({ style: ImpactStyle.Light });
    }

    activeActionRef.current = activeItem;
  }

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
    else return ratio <= -SECOND_ACTION_RATIO ? 1 : 0;
  }, [ratio, startActions, SECOND_ACTION_RATIO]);

  const startActionColor = startActions[currentStartActionIndex]?.bgColor;

  const startActionContents = useMemo(() => {
    const action = startActions[currentStartActionIndex];
    if (!action) return;

    const icon = action.icon;
    return (
      <SlashedIcon
        icon={icon}
        slash={action.slash ?? false}
        bgColor={action.bgColor}
      />
    );

    // NOTE: This caches the content so that it doesn't re-render until completely closed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStartActionIndex, ratio]);

  /*
   * End Actions
   */

  const currentEndActionIndex = useMemo(() => {
    if (!endActions[1]) return 0;
    else if (!endActions[0]) return 1;
    else return ratio >= SECOND_ACTION_RATIO ? 1 : 0;
  }, [ratio, endActions, SECOND_ACTION_RATIO]);

  const endActionColor = endActions[currentEndActionIndex]?.bgColor;

  const endActionContents = useMemo(() => {
    const action = endActions[currentEndActionIndex];
    if (!action) return;

    const icon = action.icon;
    return (
      <SlashedIcon
        icon={icon}
        slash={action.slash ?? false}
        bgColor={action.bgColor}
      />
    );

    // NOTE: This caches the content so that it doesn't re-render until completely closed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEndActionIndex, ratio]);

  const startRatio = useMemo(() => {
    return startActions[0] ? -FIRST_ACTION_RATIO : -SECOND_ACTION_RATIO;
  }, [startActions, SECOND_ACTION_RATIO]);
  const endRatio = useMemo(() => {
    return endActions[0] ? FIRST_ACTION_RATIO : SECOND_ACTION_RATIO;
  }, [endActions, SECOND_ACTION_RATIO]);

  async function onDragStop(e: TouchEvent | MouseEvent) {
    if (!dragRef.current) return;
    if (!dragging) return;

    if (ratio <= startRatio) {
      startActions[currentStartActionIndex]?.trigger(e);
    } else if (ratio >= endRatio) {
      endActions[currentEndActionIndex]?.trigger(e);
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
      {canSwipeStart && (
        <IonItemOptions side="start">
          <StyledIonItemOption color={startActionColor}>
            <OptionContainer active={ratio <= startRatio} slot="top">
              {startActionContents}
            </OptionContainer>
          </StyledIonItemOption>
        </IonItemOptions>
      )}

      {canSwipeEnd && (
        <IonItemOptions side="end">
          <StyledIonItemOption color={endActionColor}>
            <OptionContainer active={ratio >= endRatio} slot="top">
              {endActionContents}
            </OptionContainer>
          </StyledIonItemOption>
        </IonItemOptions>
      )}

      {children}
    </StyledIonItemSliding>
  );
}
