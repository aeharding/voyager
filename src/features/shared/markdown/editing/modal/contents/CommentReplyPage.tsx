import { styled } from "@linaria/react";
import {
  IonButtons,
  IonButton,
  IonToolbar,
  IonTitle,
  IonText,
  useIonModal,
  IonIcon,
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
import CommentEditorContent from "./CommentEditorContent";
import { arrowBackSharp, send } from "ionicons/icons";
import { useAppDispatch, useAppSelector } from "../../../../../../store";
import useClient from "../../../../../../helpers/useClient";
import useAppToast from "../../../../../../helpers/useAppToast";
import {
  loggedInAccountsSelector,
  userHandleSelector,
} from "../../../../../auth/authSelectors";
import { getClient } from "../../../../../../services/lemmy";
import AccountSwitcher from "../../../../../auth/AccountSwitcher";
import { isLemmyError } from "../../../../../../helpers/lemmyErrors";
import { receivedComments } from "../../../../../comment/commentSlice";
import AppHeader from "../../../../AppHeader";
import { isIosTheme } from "../../../../../../helpers/device";
import { Centered, Spinner } from "../../../../../auth/login/LoginNav";

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

type CommentReplyPageProps = {
  dismiss: (reply?: CommentView | undefined) => void;
  setCanDismiss: (canDismiss: boolean) => void;
  item: CommentReplyItem;
};

/**
 * New comment replying to something
 */
export default function CommentReplyPage({
  dismiss,
  setCanDismiss,
  item,
}: CommentReplyPageProps) {
  const comment = "comment" in item ? item.comment : undefined;

  const dispatch = useAppDispatch();
  const [replyContent, setReplyContent] = useState("");
  const client = useClient();
  const presentToast = useAppToast();
  const [loading, setLoading] = useState(false);
  const isSubmitDisabled = !replyContent.trim() || loading;

  const userHandle = useAppSelector(userHandleSelector);
  const [selectedAccount, setSelectedAccount] = useState(userHandle);

  const isUsingAppAccount = selectedAccount === userHandle;

  const accounts = useAppSelector(loggedInAccountsSelector);
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
      allowEdit: false,
      showGuest: false,
      activeHandle: selectedAccount,
      onDismiss: (data?: string, role?: string) =>
        onDismissAccountSwitcher(data, role),
      onSelectAccount: async (account: string) => {
        if ("private_message" in item)
          throw new Error("Cannot switch account on private message reply");

        // Switching back to local account
        if (account === userHandle) {
          resolvedRef.current = undefined;
          setSelectedAccount(account);
          return;
        }

        // Using a remote account
        const accountJwt = accounts?.find(
          ({ handle }) => handle === account,
        )?.jwt;

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
        } catch (_) {
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
  }

  useEffect(() => {
    setCanDismiss(!replyContent);
  }, [replyContent, setCanDismiss]);

  return (
    <>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => dismiss()}>
              {isIosTheme() ? (
                "Cancel"
              ) : (
                <IonIcon icon={arrowBackSharp} slot="icon-only" />
              )}
            </IonButton>
          </IonButtons>
          <IonTitle>
            <Centered>
              <TitleContainer
                onClick={() => {
                  if (accounts?.length === 1) return;
                  if ("private_message" in item) return;

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
              color={isSubmitDisabled ? "medium" : undefined}
              onClick={submit}
            >
              {isIosTheme() ? "Post" : <IonIcon icon={send} slot="icon-only" />}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </AppHeader>

      <CommentEditorContent
        ref={textareaRef}
        text={replyContent}
        setText={setReplyContent}
        onSubmit={submit}
        onDismiss={dismiss}
      >
        {"post" in item ? <ItemReplyingTo item={item} /> : undefined}
      </CommentEditorContent>
    </>
  );
}
