import { useIonActionSheet, useIonAlert } from "@ionic/react";
import { getCanModerate } from "./useCanModerate";
import { CommentReport, PostReport, PostView } from "lemmy-js-client";
import {
  checkmarkCircleOutline,
  hammerOutline,
  lockClosedOutline,
  lockOpenOutline,
  megaphoneOutline,
  trashOutline,
} from "ionicons/icons";
import store, { useAppDispatch } from "../../store";
import { modLockPost, modRemovePost, modStickyPost } from "../post/postSlice";
import {
  buildBanFailed,
  buildBanned,
  buildLocked,
  buildStickied,
  postApproved,
  postRemoved,
  postRestored,
} from "../../helpers/toastMessages";
import useAppToast from "../../helpers/useAppToast";
import { reportsByPostIdSelector, resolvePostReport } from "./modSlice";
import { compact, groupBy, values } from "lodash";
import { useCallback, useContext } from "react";
import { PageContext } from "../auth/PageContext";
import { banUser } from "../user/userSlice";
import { trashEllipse } from "../icons";

export default function usePostModActions(post: PostView) {
  const dispatch = useAppDispatch();
  const presentToast = useAppToast();
  const [presentAlert] = useIonAlert();
  const [presentActionSheet] = useIonActionSheet();
  const { presentBanUser } = useContext(PageContext);

  return useCallback(() => {
    const state = store.getState();

    const role = getCanModerate(post.community);

    const bannedFromCommunity =
      state.user.bannedByCommunityIdUserId[
        `${post.community.id}${post.creator.id}`
      ];

    const banned = bannedFromCommunity ?? post.creator_banned_from_community;

    const reports = reportsByPostIdSelector(state)[post.post.id];

    presentActionSheet({
      cssClass: `${role} left-align-buttons report-reasons`,
      header: stringifyReports(reports),
      buttons: compact([
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
        !post.post.removed && {
          text: "Remove With Reason",
          icon: trashEllipse,
          handler: () => {
            presentAlert({
              message: "Remove with reason",
              buttons: [
                {
                  text: "Remove",
                  cssClass: "mod",
                  handler: ({ reason }) => {
                    (async () => {
                      await dispatch(modRemovePost(post.post.id, true, reason));

                      presentToast(postRemoved);
                    })();
                  },
                },
                { text: "Cancel", role: "cancel", cssClass: "mod" },
              ],
              inputs: [
                {
                  placeholder: "Public removal reason",
                  name: "reason",
                },
              ],
            });
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
        role === "mod" || role === "admin-local"
          ? {
              text: !banned ? "Ban User" : "Unban User",
              icon: hammerOutline,
              handler: () => {
                (async () => {
                  if (banned) {
                    try {
                      await dispatch(
                        banUser({
                          person_id: post.creator.id,
                          community_id: post.community.id,
                          ban: false,
                        }),
                      );
                    } catch (error) {
                      presentToast(buildBanFailed(false));
                      throw error;
                    }

                    presentToast(buildBanned(false));

                    return;
                  }

                  presentBanUser({
                    user: post.creator,
                    community: post.community,
                  });
                })();
              },
            }
          : undefined,
        {
          text: "Cancel",
          role: "cancel",
        },
      ]),
    });
  }, [
    dispatch,
    post,
    presentActionSheet,
    presentBanUser,
    presentToast,
    presentAlert,
  ]);
}

export function stringifyReports(
  reports: (CommentReport | PostReport)[] | undefined,
): string | undefined {
  if (!reports?.length) return;

  return values(groupBy(reports, (r) => r.reason))
    .map(
      (reports) =>
        `${reports.length} report${reports.length === 1 ? "" : "s"}: “${
          reports[0]!.reason
        }”`,
    )
    .join("\n");
}
