import { styled } from "@linaria/react";
import { SlideableVoteItem } from "./internal/shared";
import { SwipeActions } from "../../../services/db";
import { FunctionComponent } from "react";
import { useAppSelector } from "../../../store";
import { VotableActionsImpl } from "./internal/impl/VotableActionsImpl";
import DMActionsImpl from "./internal/impl/DMActionsImpl";
import { PrivateMessageView } from "lemmy-js-client";

const StyledItemContainer = styled.div`
  --ion-item-border-color: transparent;
`;

interface BaseSlidingVoteProps {
  children: React.ReactNode;
  className?: string;
  item: SlideableVoteItem;
  rootIndex?: number;
  collapsed?: boolean;
  actions: SwipeActions;
  onHide?: () => void;
}

function GenericBaseSlidingWrapper<
  T extends BaseSlidingVoteProps | BaseSlidingDMProps,
>({
  component: Component,
  ...props
}: T & {
  component: FunctionComponent<T>;
}) {
  const disableSwipes = useAppSelector(
    (state) =>
      state.gesture.swipe.disableLeftSwipes &&
      state.gesture.swipe.disableRightSwipes,
  );

  if (!disableSwipes) {
    return <Component {...(props as unknown as T)} />;
  } else {
    // don't initialize all the sliding stuff if it's completely unused
    return (
      <StyledItemContainer className={props.className}>
        {props.children}
      </StyledItemContainer>
    );
  }
}

export function BaseSlidingVote(props: BaseSlidingVoteProps) {
  return (
    <GenericBaseSlidingWrapper {...props} component={VotableActionsImpl} />
  );
}

export function BaseSlidingDM(props: BaseSlidingDMProps) {
  return <GenericBaseSlidingWrapper {...props} component={DMActionsImpl} />;
}

type BaseSlidingDMProps = { item: PrivateMessageView } & Omit<
  BaseSlidingVoteProps,
  "item"
>;
