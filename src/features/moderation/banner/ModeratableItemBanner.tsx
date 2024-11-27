import { Comment, CommentView, Post, PostView } from "lemmy-js-client";

import { cx } from "#/helpers/css";
import { useAppSelector } from "#/store";

import {
  reportsByCommentIdSelector,
  reportsByPostIdSelector,
} from "../modSlice";
import RemovedBanner from "./RemovedBanner";
import ReportBanner from "./ReportBanner";

import styles from "./ModeratableItemBanner.module.css";

export const ItemModState = {
  None: 0,
  Flagged: 1,
  RemovedByMod: 2,
} as const;

export type ItemModStateType = (typeof ItemModState)[keyof typeof ItemModState];

interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  modState: typeof ItemModState.Flagged | typeof ItemModState.RemovedByMod;
}

export function Banner({ modState, ...props }: BannerProps) {
  return (
    <div
      {...props}
      className={cx(styles.sharedBanner, props.className)}
      style={{
        background: getModStateBannerBgColor(modState),
        color: getModStateBannerColor(modState),
      }}
    />
  );
}

interface RemovedByBannerProps {
  modState: ItemModStateType;
  itemView: CommentView | PostView;
}

export default function ModeratableItemBanner({
  modState,
  itemView,
}: RemovedByBannerProps) {
  switch (modState) {
    case ItemModState.None:
      return;
    case ItemModState.RemovedByMod:
      return <RemovedBanner itemView={itemView} />;
    case ItemModState.Flagged:
      return <ReportBanner itemView={itemView} />;
  }
}

export function useItemModState(item: Comment | Post): ItemModStateType {
  const hasPostReports = useAppSelector(
    (state) => !!reportsByPostIdSelector(state)[item.id]?.length,
  );
  const hasCommentReports = useAppSelector(
    (state) => !!reportsByCommentIdSelector(state)[item.id]?.length,
  );

  if (item.removed) return ItemModState.RemovedByMod;

  if ("path" in item) {
    if (hasCommentReports) return ItemModState.Flagged;
  } else {
    if (hasPostReports) return ItemModState.Flagged;
  }

  return ItemModState.None;
}

export function getModStateBackgroundColor(
  modState: ItemModStateType,
): string | undefined {
  switch (modState) {
    case ItemModState.Flagged:
      return "rgba(255, 255, 0, 0.15)";
    case ItemModState.RemovedByMod:
      return "rgba(255, 0, 0, 0.3)";
    case ItemModState.None:
      return undefined;
  }
}

export function getModStateBannerBgColor(
  modState: ItemModStateType,
): string | undefined {
  switch (modState) {
    case ItemModState.Flagged:
      return "var(--ion-color-warning)";
    case ItemModState.RemovedByMod:
      return "red";
    case ItemModState.None:
      return undefined;
  }
}

export function getModStateBannerColor(
  modState: ItemModStateType,
): string | undefined {
  switch (modState) {
    case ItemModState.Flagged:
      return "black";
    case ItemModState.RemovedByMod:
      return "white";
    case ItemModState.None:
      return undefined;
  }
}
