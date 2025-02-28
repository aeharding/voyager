import { IonAlertCustomEvent, OverlayEventDetail } from "@ionic/core";
import { IonActionSheet, IonAlert } from "@ionic/react";
import { CommentView, PostView, PrivateMessageView } from "lemmy-js-client";
import { useImperativeHandle, useState } from "react";

import { isLemmyError } from "#/helpers/lemmyErrors";
import { buildReported } from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import useClient from "#/helpers/useClient";

export type ReportableItem = CommentView | PostView | PrivateMessageView;

export interface ReportHandle {
  present: (item: ReportableItem) => void;
}

export default function Report({
  ref,
}: {
  ref: React.RefObject<ReportHandle | undefined>;
}) {
  const presentToast = useAppToast();
  const [item, setItem] = useState<ReportableItem | undefined>();
  const [reportOptionsOpen, setReportOptionsOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const client = useClient();

  const type = (() => {
    if (!item) return;

    if ("comment" in item) return "Comment";
    if ("post" in item) return "Post";
    if ("private_message" in item) return "Private message";
  })();

  useImperativeHandle(
    ref,
    () => ({
      present: (item: ReportableItem) => {
        setItem(item);
        setReportOptionsOpen(true);
      },
    }),
    [],
  );

  async function submitReport(reason: string) {
    if (!item) return;

    try {
      if ("comment" in item) {
        await client.createCommentReport({
          reason,
          comment_id: item.comment.id,
        });
      } else if ("post" in item) {
        await client.createPostReport({
          reason,
          post_id: item.post.id,
        });
      } else if ("private_message" in item) {
        await client.createPrivateMessageReport({
          reason,
          private_message_id: item.private_message.id,
        });
      }
    } catch (error) {
      let errorDetail = "Please try again.";

      if (isLemmyError(error, "couldnt_create_report")) {
        errorDetail = "You may have already reported this.";
      }

      presentToast({
        message: `Failed to report ${type?.toLowerCase()}. ${errorDetail}`,
        color: "danger",
      });

      throw error;
    }

    if (type) presentToast(buildReported(type));
  }

  const submitCustomReason = async function (
    e: IonAlertCustomEvent<OverlayEventDetail>,
  ) {
    setCustomOpen(false);

    if (e.detail.role === "cancel" || e.detail.role === "backdrop") return;

    await submitReport(e.detail.data.values.reason);
    setCustomOpen(false);
  };

  return (
    <>
      <IonActionSheet
        cssClass="left-align-buttons"
        isOpen={reportOptionsOpen}
        onDidDismiss={() => setReportOptionsOpen(false)}
        onWillDismiss={async (e) => {
          if (!e.detail.data) return;

          if (e.detail.data === "other") {
            setReportOptionsOpen(false);
            setCustomOpen(true);
            return;
          }

          await submitReport(e.detail.data);
          setReportOptionsOpen(false);
        }}
        header={`Report ${type}`}
        buttons={[
          {
            text: "Breaks Community Rules",
            data: "Breaks Community Rules",
          },
          {
            text: "Spam or Abuse",
            data: "Spam or Abuse",
          },
          {
            text: "Custom Response",
            data: "other",
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ]}
      />
      <IonAlert
        isOpen={customOpen}
        header="Custom report reason"
        onDidDismiss={submitCustomReason}
        inputs={[
          {
            name: "reason",
            placeholder: "Custom report details",
          },
        ]}
        buttons={[{ text: "OK" }, { text: "Cancel", role: "cancel" }]}
      />
    </>
  );
}
