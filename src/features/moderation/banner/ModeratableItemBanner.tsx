import styled from "@emotion/styled";
import { Comment, CommentView, Post, PostView } from "lemmy-js-client";
import { useAppSelector } from "../../../store";
import {
  reportsByCommentIdSelector,
  reportsByPostIdSelector,
} from "../modSlice";
import RemovedBanner from "./RemovedBanner";
import ReportBanner from "./ReportBanner";

export const Banner = styled.div<{ modState: ItemModState }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  font-size: 0.875rem;

  padding: 6px 0;
  border-radius: 6px;

  text-align: center;

  background: ${({ modState }) => getModStateBannerBgColor(modState)};
  color: ${({ modState }) => getModStateBannerColor(modState)};
`;

interface RemovedByBannerProps {
  modState: ItemModState;
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

export enum ItemModState {
  None,
  Flagged,
  RemovedByMod,
}

export function useItemModState(item: Comment | Post): ItemModState {
  const reportsByPostId = useAppSelector(reportsByPostIdSelector);
  const reportsByCommentId = useAppSelector(reportsByCommentIdSelector);

  if (item.removed) return ItemModState.RemovedByMod;

  if (!("path" in item)) {
    if (reportsByPostId[item.id]?.length) return ItemModState.Flagged;
  } else {
    if (reportsByCommentId[item.id]?.length) return ItemModState.Flagged;
  }

  return ItemModState.None;
}

export function getModStateBackgroundColor(
  modState: ItemModState,
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
  modState: ItemModState,
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
  modState: ItemModState,
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
