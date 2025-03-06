import {
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
  IonToolbar,
} from "@ionic/react";
import { arrowBackSharp, send } from "ionicons/icons";
import {
  CommentReplyView,
  CommentView,
  PersonMentionView,
  PostView,
  ResolveObjectResponse,
} from "lemmy-js-client";
import { MutableRefObject, useEffect, useRef, useState } from "react";

import {
  getInstanceFromHandle,
  loggedInAccountsSelector,
  userHandleSelector,
} from "#/features/auth/authSelectors";
import { receivedComments } from "#/features/comment/commentSlice";
import MultilineTitle from "#/features/shared/MultilineTitle";
import { isIosTheme } from "#/helpers/device";
import { isLemmyError } from "#/helpers/lemmyErrors";
import { commentPosted } from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import useClient from "#/helpers/useClient";
import { getClient } from "#/services/lemmy";
import { useAppDispatch, useAppSelector } from "#/store";

import AppHeader from "../../../../AppHeader";
import CommentEditorContent from "./CommentEditorContent";
import ItemReplyingTo from "./ItemReplyingTo";
import {
  TemporarySelectedAccountProvider,
  useTemporarySelectedAccount,
} from "./TemporarySelectedAccountContext";

export type CommentReplyItem =
  | CommentView
  | PostView
  | PersonMentionView
  | CommentReplyView;

interface CommentReplyPageProps {
  dismiss: (reply?: CommentView | undefined) => void;
  setCanDismiss: (canDismiss: boolean) => void;
  item: CommentReplyItem;
}

/**
 * New comment replying to something
 */
export default function CommentReplyPage(props: CommentReplyPageProps) {
  const presentToast = useAppToast();

  const comment = "comment" in props.item ? props.item.comment : undefined;

  const resolvedRef = useRef<ResolveObjectResponse>(undefined);

  const accounts = useAppSelector(loggedInAccountsSelector);
  const userHandle = useAppSelector(userHandleSelector);

  async function onSelectAccount(account: string) {
    // Switching back to local account
    if (account === userHandle) {
      resolvedRef.current = undefined;
      return;
    }

    // Using a remote account
    const accountJwt = accounts?.find(({ handle }) => handle === account)?.jwt;

    if (!accountJwt) throw new Error("Error switching accounts");

    const instance = getInstanceFromHandle(account);
    const client = getClient(instance, accountJwt);

    // Lookup the comment from the perspective of the remote instance.
    // The remote instance may not know about the thing we're trying to comment on.
    // Also, IDs are not the same between instances.
    try {
      resolvedRef.current = await client.resolveObject({
        q: comment?.ap_id ?? props.item.post.ap_id,
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
  }

  return (
    <TemporarySelectedAccountProvider onSelectAccount={onSelectAccount}>
      <CommentReplyPageWithAccount {...props} resolvedRef={resolvedRef} />
    </TemporarySelectedAccountProvider>
  );
}

interface CommentReplyPageContentProps extends CommentReplyPageProps {
  resolvedRef: MutableRefObject<ResolveObjectResponse | undefined>;
}

function CommentReplyPageWithAccount({
  dismiss,
  setCanDismiss,
  item,
  resolvedRef,
}: CommentReplyPageContentProps) {
  const comment = "comment" in item ? item.comment : undefined;

  const dispatch = useAppDispatch();
  const [replyContent, setReplyContent] = useState("");
  const client = useClient();
  const presentToast = useAppToast();
  const [loading, setLoading] = useState(false);
  const isSubmitDisabled = !replyContent.trim() || loading;

  const { account, accountClient, presentAccountSwitcher } =
    useTemporarySelectedAccount();

  const userHandle = useAppSelector(userHandleSelector);
  const isUsingAppAccount = account?.handle === userHandle;

  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        if (!accountClient) throw new Error("Unexpected error occurred.");

        // Post comment to selected remote instance
        const remoteComment = await accountClient.createComment({
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
      presentToast(commentPosted);
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
          <MultilineTitle
            subheader={account?.handle}
            onClick={() => {
              presentAccountSwitcher(() => {
                requestAnimationFrame(() => {
                  textareaRef.current?.focus();
                });
              });
            }}
          >
            New Comment
          </MultilineTitle>
          <IonButtons slot="end">
            {loading ? (
              <IonSpinner />
            ) : (
              <IonButton
                strong
                type="submit"
                disabled={isSubmitDisabled}
                color={isSubmitDisabled ? "medium" : undefined}
                onClick={submit}
              >
                {isIosTheme() ? (
                  "Post"
                ) : (
                  <IonIcon icon={send} slot="icon-only" />
                )}
              </IonButton>
            )}
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
