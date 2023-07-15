import { IonActionSheet, IonAlert, useIonToast } from "@ionic/react";
import { CommentView, PostView, PrivateMessageView } from "lemmy-js-client";
import { forwardRef, useImperativeHandle, useState } from "react";
import useClient from "../../helpers/useClient";
import { useAppSelector } from "../../store";
import { jwtSelector } from "../auth/authSlice";
import useDebounceFn from "../../helpers/useDebounceFn";

export type ReportableItem = CommentView | PostView | PrivateMessageView;

export type ReportHandle = {
  present: (item: ReportableItem) => void;
};

export const Report = forwardRef<ReportHandle>(function Report(_, ref) {
  const jwt = useAppSelector(jwtSelector);
  const [presentToast] = useIonToast();
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

  useImperativeHandle(ref, () => ({
    present: (item: ReportableItem) => {
      setItem(item);
      setReportOptionsOpen(true);
    },
  }));

  async function submitReport(reason: string) {
    if (!item || !jwt) return;

    try {
      if ("comment" in item) {
        await client.createCommentReport({
          reason,
          comment_id: item.comment.id,
          auth: jwt,
        });
      } else if ("post" in item) {
        await client.createPostReport({
          reason,
          post_id: item.post.id,
          auth: jwt,
        });
      } else if ("private_message" in item) {
        await client.createPrivateMessageReport({
          reason,
          private_message_id: item.private_message.id,
          auth: jwt,
        });
      }
    } catch (error) {
      let errorDetail = "Please try again.";

      if (error === "couldnt_create_report") {
        errorDetail = "You may have already reported this.";
      }

      presentToast({
        message: `Failed to report ${type?.toLowerCase()}. ${errorDetail}`,
        duration: 3500,
        position: "bottom",
        color: "danger",
      });

      throw error;
    }

    presentToast({
      message: `${type} reported!`,
      duration: 3500,
      position: "bottom",
      color: "primary",
    });
  }

  // Workaround for Ionic bug where onDidDismiss is called twice
  const submitCustomReason = useDebounceFn(async (e) => {
    setCustomOpen(false);

    if (e.detail.role === "cancel" || e.detail.role === "backdrop") return;

    await submitReport(e.detail.data.values.reason);
    setCustomOpen(false);
  }, 50);

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
            text: "Spam or Abuse",
            data: "Spam or Abuse",
          },
          {
            text: "Custom Report",
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
});
