import { IonIcon, IonLoading } from "@ionic/react";
import { flagOutline } from "ionicons/icons";
import { CommentView, PostView } from "lemmy-js-client";

import { isPost } from "#/helpers/lemmy";
import { useAppSelector } from "#/store";

import {
  reportsByCommentIdSelector,
  reportsByPostIdSelector,
} from "../modSlice";
import useCommentModActions from "../useCommentModActions";
import usePostModActions from "../usePostModActions";
import { Banner, ItemModState } from "./ModeratableItemBanner";

interface ReportBannerProps {
  itemView: PostView | CommentView;
}

export default function ReportBanner({ itemView }: ReportBannerProps) {
  if (isPost(itemView)) {
    return <PostReportBanner post={itemView} />;
  } else {
    return <CommentReportBanner comment={itemView} />;
  }
}

function PostReportBanner({ post }: { post: PostView }) {
  const presentPostModActions = usePostModActions(post);
  const reports = useAppSelector(
    (state) => reportsByPostIdSelector(state)[post.post.id],
  );

  return (
    <SharedBanner
      onClick={presentPostModActions}
      reportsCount={reports?.length ?? 0}
    />
  );
}

function CommentReportBanner({ comment }: { comment: CommentView }) {
  const { loading, present } = useCommentModActions(comment);
  const reports = useAppSelector(
    (state) => reportsByCommentIdSelector(state)[comment.comment.id],
  );

  return (
    <>
      <IonLoading isOpen={loading} />
      <SharedBanner onClick={present} reportsCount={reports?.length ?? 0} />
    </>
  );
}

function SharedBanner({
  reportsCount,
  onClick,
}: {
  reportsCount: number;
  onClick: () => void;
}) {
  return (
    <Banner
      modState={ItemModState.Flagged}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <IonIcon icon={flagOutline} /> {reportsCount} Report
      {reportsCount === 1 ? "" : "s"}
    </Banner>
  );
}
