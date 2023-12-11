import styled from "@emotion/styled";
import {
  IonButtons,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonText,
  useIonModal,
} from "@ionic/react";
import {
  CommentReplyView,
  CommentView,
  PersonMentionView,
  PostView,
  ResolveObjectResponse,
} from "lemmy-js-client";
import { useEffect, useMemo, useRef, useState } from "react";
import ItemReplyingTo from "./ItemReplyingTo";
import useClient from "../../../../helpers/useClient";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { Centered, Spinner } from "../../../auth/Login";
import { handleSelector } from "../../../auth/authSlice";
import { receivedComments } from "../../commentSlice";
import CommentContent from "../shared";
import useTextRecovery, {
  clearRecoveredText,
} from "../../../../helpers/useTextRecovery";
import useAppToast from "../../../../helpers/useAppToast";
import { isLemmyError } from "../../../../helpers/lemmy";
import AccountSwitcher from "../../../auth/AccountSwitcher";
import { getClient } from "../../../../services/lemmy";

export const UsernameIonText = styled(IonText)`
  font-size: 0.7em;
  font-weight: normal;
`;

export const TitleContainer = styled.div`
  line-height: 1;
`;

export type CommentReplyItem =
  | CommentView
  | PostView
  | PersonMentionView
  | CommentReplyView;

type CommentReplyProps = {
  dismiss: (reply?: CommentView | undefined) => void;
  setCanDismiss: (canDismiss: boolean) => void;
  item: CommentReplyItem;
};

/**
 * New comment replying to something
 */
export default function CommentReply({
  dismiss,
  setCanDismiss,
  item,
}: CommentReplyProps) {
  const comment = "comment" in item ? item.comment : undefined;

  const dispatch = useAppDispatch();
  const [replyContent, setReplyContent] = useState("");
  const client = useClient();
  const presentToast = useAppToast();
  const [loading, setLoading] = useState(false);
  const isSubmitDisabled = !replyContent.trim() || loading;

  const userHandle = useAppSelector(handleSelector);
  const [selectedAccount, setSelectedAccount] = useState(userHandle);

  const isUsingAppAccount = selectedAccount === userHandle;

  const accounts = useAppSelector((state) => state.auth.accountData?.accounts);
  const resolvedRef = useRef<ResolveObjectResponse | undefined>();
  const selectedAccountJwt = accounts?.find(
    ({ handle }) => handle === selectedAccount,
  )?.jwt;
  const selectedAccountClient = useMemo(() => {
    if (!selectedAccount) return;

    const instance = selectedAccount.split("@")[1]!;

    return getClient(instance, selectedAccountJwt);
  }, [selectedAccount, selectedAccountJwt]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [presentAccountSwitcher, onDismissAccountSwitcher] = useIonModal(
    AccountSwitcher,
    {
      onDismiss: (data: string, role: string) =>
        onDismissAccountSwitcher(data, role),
      allowEdit: false,
      onSelectAccount: async (account: string) => {
        // Switching back to local account
        if (account === userHandle) {
          resolvedRef.current = undefined;
          setSelectedAccount(account);
          return;
        }

        // Using a remote account
        const accountJwt = accounts?.find(({ handle }) => handle === account)
          ?.jwt;

        if (!accountJwt) throw new Error("Error switching accounts");

        const instance = account.split("@")[1]!;
        const client = getClient(instance, accountJwt);

        // Lookup the comment from the perspective of the remote instance.
        // The remote instance may not know about the thing we're trying to comment on.
        // Also, IDs are not the same between instances.
        try {
          resolvedRef.current = await client.resolveObject({
            q: comment?.ap_id ?? item.post.ap_id,
          });
        } catch (error) {
          presentToast({
            message: `This ${
              comment ? "comment" : "post"
            } does not exist on ${instance}.`,
            color: "warning",
            position: "top",
            fullscreen: true,
          });

          throw error;
        }

        setSelectedAccount(account);
      },
      activeHandle: selectedAccount,
    },
  );

  async function submit() {
    if (isSubmitDisabled) return;

    setLoading(true);

    let reply;
    let silentError = false;

    try {
      if (isUsingAppAccount) {
        reply = (
          await client.createComment({
            content: replyContent,
            parent_id: comment?.id,
            post_id: item.post.id,
          })
        ).comment_view;
      } else {
        const postId =
          resolvedRef.current?.comment?.comment.post_id ??
          resolvedRef.current?.post?.post.id;

        if (!postId) throw new Error("Post not found.");
        if (!selectedAccountClient)
          throw new Error("Unexpected error occurred.");

        // Post comment to selected remote instance
        const remoteComment = await selectedAccountClient.createComment({
          content: replyContent,
          parent_id: resolvedRef.current?.comment?.comment.id,
          post_id: postId,
        });

        try {
          // Lookup the reply from the perspective of our instance to hydrate comment tree
          reply = (
            await client.resolveObject({
              q: remoteComment.comment_view.comment.ap_id,
            })
          ).comment;
        } catch (error) {
          silentError = true;
          presentToast({
            message:
              "Your comment was successfully posted, but there was an error looking it up.",
            duration: 7_000, // user prolly like "holup wat"
            color: "warning",
            position: "top",
            fullscreen: true,
          });

          // Don't throw - the comment was posted, there was just an issue resolving
        }
      }
    } catch (error) {
      const errorDescription = isLemmyError(error, "language_not_allowed")
        ? "Please select a language in your lemmy profile settings."
        : "Please try again.";

      presentToast({
        message: `Problem posting your comment. ${errorDescription}`,
        color: "danger",
        fullscreen: true,
      });

      throw error;
    } finally {
      setLoading(false);
    }

    if (!silentError) {
      presentToast({
        message: "Comment posted!",
        color: "primary",
        position: "top",
        centerText: true,
        fullscreen: true,
      });
    }

    if (reply) dispatch(receivedComments([reply]));
    setCanDismiss(true);
    dismiss(reply);
    clearRecoveredText();
  }

  useEffect(() => {
    setCanDismiss(!replyContent);
  }, [replyContent, setCanDismiss]);

  useTextRecovery(replyContent, setReplyContent);

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton color="medium" onClick={() => dismiss()}>
              Cancel
            </IonButton>
          </IonButtons>
          <IonTitle>
            <Centered>
              <TitleContainer
                onClick={() => {
                  if (accounts?.length === 1) return;

                  presentAccountSwitcher({
                    cssClass: "small",
                    onDidDismiss: () => {
                      requestAnimationFrame(() => {
                        textareaRef.current?.focus();
                      });
                    },
                  });
                }}
              >
                <IonText>New Comment</IonText>
                <div>
                  <UsernameIonText color="medium">
                    {selectedAccount}
                  </UsernameIonText>
                </div>
              </TitleContainer>{" "}
              {loading && <Spinner color="dark" />}
            </Centered>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              strong
              type="submit"
              disabled={isSubmitDisabled}
              onClick={submit}
            >
              Post
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <CommentContent
        ref={textareaRef}
        text={replyContent}
        setText={setReplyContent}
        onSubmit={submit}
      >
        <ItemReplyingTo item={item} />
      </CommentContent>
    </>
  );
}
