import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { ItemSlidingCustomEvent } from "@ionic/core";
import {
  IonIcon,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
} from "@ionic/react";
import { arrowDownSharp, arrowUpSharp } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";

const UpvoteArrow = styled(IonIcon)<{
  willUpvote: boolean;
  slash: boolean;
  bgColor: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  width: 60px;

  opacity: 0.5;

  ${({ willUpvote }) =>
    willUpvote &&
    css`
      opacity: 1;
    `}

  ${({ slash, bgColor }) =>
    slash &&
    css`
      &::after {
        content: "";
        position: absolute;
        height: 30px;
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

interface DraggingVoteProps {
  currentVote: 1 | 0 | -1 | undefined;
  children?: React.ReactNode;
  onVote: (vote: 1 | -1 | 0) => void;
  className?: string;
}

const UPVOTE_RATIO = -1;
const DOWNVOTE_RATIO = -1.75;

export default function DraggingVote({
  currentVote,
  children,
  onVote,
  className,
}: DraggingVoteProps) {
  const dragRef = useRef<ItemSlidingCustomEvent | undefined>();
  const [ratio, setRatio] = useState(0);

  const [staleCurrentVote, setStaleCurrentVote] = useState(currentVote);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    setStaleCurrentVote(currentVote);
  }, [ratio]);

  async function onVoteDragStop() {
    if (!dragRef.current) return;
    if (!dragging) return;

    if (ratio <= DOWNVOTE_RATIO) {
      onVote(currentVote === -1 ? 0 : -1);
    } else if (ratio <= UPVOTE_RATIO) {
      onVote(currentVote === 1 ? 0 : 1);
    }

    dragRef.current.target.closeOpened();
    setDragging(false);
  }

  return (
    <IonItemSliding
      onIonDrag={async (e) => {
        dragRef.current = e;
        const ratio = await e.target.getSlidingRatio();
        if (Math.round(ratio) === ratio) return;
        setRatio(ratio);
        setDragging(true);
      }}
      onTouchEnd={onVoteDragStop}
      onMouseUp={onVoteDragStop}
      className={className}
    >
      <IonItemOptions side="start">
        <IonItemOption color={ratio <= DOWNVOTE_RATIO ? "danger" : "primary"}>
          <UpvoteArrow
            slash={
              ratio <= DOWNVOTE_RATIO
                ? staleCurrentVote === -1
                : staleCurrentVote === 1
            }
            willUpvote={ratio <= UPVOTE_RATIO}
            icon={ratio <= DOWNVOTE_RATIO ? arrowDownSharp : arrowUpSharp}
            bgColor={ratio <= DOWNVOTE_RATIO ? "danger" : "primary"}
          />
        </IonItemOption>
      </IonItemOptions>
      {children}
    </IonItemSliding>
  );
}
