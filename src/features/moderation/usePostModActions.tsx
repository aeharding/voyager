import { useIonActionSheet, useIonAlert } from "@ionic/react";
import {
  checkmarkCircleOutline,
  hammerOutline,
  lockClosedOutline,
  lockOpenOutline,
  megaphoneOutline,
  trashOutline,
} from "ionicons/icons";
import { CommentReport, PostReport, PostView } from "lemmy-js-client";
import { group, sift } from "radashi";
import { useCallback, useContext } from "react";

import { PageContext } from "#/features/auth/PageContext";
import { trashEllipse } from "#/features/icons";
import {
  modLockPost,
  modRemovePost,
  modStickyPost,
} from "#/features/post/postSlice";
import { banUser } from "#/features/user/userSlice";
import {
  buildBanFailed,
  buildBanned,
  buildLocked,
  buildStickied,
  postApproved,
  postRemoved,
  postRestored,
} from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import store, { useAppDispatch } from "#/store";

import { reportsByPostIdSelector, resolvePostReport } from "./modSlice";
import { getCanModerate } from "./useCanModerate";

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
      buttons: sift([
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

  // TODO sift is not needed here, types are wrong
  // https://github.com/radashi-org/radashi/issues/287
  return sift(Object.values(group(reports, (r) => r.reason)))
    .map(
      (reports) =>
        `${reports.length} report${reports.length === 1 ? "" : "s"}: “${
          reports[0]!.reason
        }”`,
    )
    .join("\n");
}
