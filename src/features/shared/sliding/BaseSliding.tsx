import { PrivateMessageView } from "lemmy-js-client";
import { FunctionComponent } from "react";

import { cx } from "#/helpers/css";
import { SwipeActions } from "#/services/db";
import { useAppSelector } from "#/store";

import DMActionsImpl from "./internal/impl/DMActionsImpl";
import { VotableActionsImpl } from "./internal/impl/VotableActionsImpl";
import { SlideableVoteItem } from "./internal/shared";

import styles from "./BaseSliding.module.css";

interface BaseSlidingVoteProps extends React.PropsWithChildren {
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
      <div className={cx(props.className, styles.itemContainer)}>
        {props.children}
      </div>
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
