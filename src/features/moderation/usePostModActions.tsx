import { useIonActionSheet } from "@ionic/react";
import useCanModerate from "./useCanModerate";
import { CommentReport, PostReport, PostView } from "lemmy-js-client";
import {
  checkmarkCircleOutline,
  lockClosedOutline,
  lockOpenOutline,
  megaphoneOutline,
  trashOutline,
} from "ionicons/icons";
import { useAppDispatch, useAppSelector } from "../../store";
import { modLockPost, modRemovePost, modStickyPost } from "../post/postSlice";
import {
  buildLocked,
  buildStickied,
  postApproved,
  postRemoved,
  postRestored,
} from "../../helpers/toastMessages";
import useAppToast from "../../helpers/useAppToast";
import { reportsByPostIdSelector, resolvePostReport } from "./modSlice";
import { groupBy, values } from "lodash";
import { notEmpty } from "../../helpers/array";

export default function usePostModActions(post: PostView) {
  const dispatch = useAppDispatch();
  const presentToast = useAppToast();
  const [presentActionSheet] = useIonActionSheet();
  const role = useCanModerate(post.community);

  const reports = useAppSelector(
    (state) => reportsByPostIdSelector(state)[post.post.id],
  );

  return () => {
    presentActionSheet({
      cssClass: `${role} left-align-buttons report-reasons`,
      header: stringifyReports(reports),
      buttons: [
        !post.post.removed && reports?.length
          ? {
              text: "Approve",
              icon: checkmarkCircleOutline,
              handler: () => {
                (async () => {
                  await dispatch(resolvePostReport(post.post.id));

                  presentToast(postApproved);
                })();
              },
            }
          : undefined,
        !post.post.removed
          ? {
              text: "Remove",
              icon: trashOutline,
              handler: () => {
                (async () => {
                  await dispatch(modRemovePost(post.post.id, true));

                  presentToast(postRemoved);
                })();
              },
            }
          : {
              text: "Restore",
              icon: checkmarkCircleOutline,
              handler: () => {
                (async () => {
                  await dispatch(modRemovePost(post.post.id, false));

                  presentToast(postRestored);
                })();
              },
            },
        {
          text: !post.post.featured_community ? "Sticky" : "Unsticky",
          icon: megaphoneOutline,
          handler: () => {
            (async () => {
              await dispatch(
                modStickyPost(post.post.id, !post.post.featured_community),
              );

              presentToast(buildStickied(!post.post.featured_community));
            })();
          },
        },
        {
          text: !post.post.locked ? "Lock" : "Unlock",
          icon: !post.post.locked ? lockClosedOutline : lockOpenOutline,
          handler: () => {
            (async () => {
              await dispatch(modLockPost(post.post.id, !post.post.locked));

              presentToast(buildLocked(!post.post.locked));
            })();
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ].filter(notEmpty),
    });
  };
}

export function stringifyReports(
  reports: (CommentReport | PostReport)[] | undefined,
): string | undefined {
  if (!reports?.length) return;

  return values(groupBy(reports, (r) => r.reason))
    .map(
      (reports) =>
        `${reports.length} report${reports.length === 1 ? "" : "s"}: “${
          reports[0].reason
        }”`,
    )
    .join("\n");
}
