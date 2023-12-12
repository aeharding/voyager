import { useIonModal } from "@ionic/react";
import React, {
  RefObject,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CommentReplyItem } from "../comment/compose/reply/CommentReply";
import Login from "../auth/Login";
import { useAppDispatch, useAppSelector } from "../../store";
import { changeAccount, jwtSelector } from "../auth/authSlice";
import CommentReplyModal from "../comment/compose/reply/CommentReplyModal";
import { Comment, CommentView, PostView } from "lemmy-js-client";
import CommentEditModal from "../comment/compose/edit/CommentEditModal";
import { Report, ReportHandle, ReportableItem } from "../report/Report";
import PostEditorModal from "../post/new/PostEditorModal";
import SelectTextModal from "../../pages/shared/SelectTextModal";
import ShareAsImageModal, {
  ShareAsImageData,
} from "../share/asImage/ShareAsImageModal";
import AccountSwitcher from "./AccountSwitcher";

interface IPageContext {
  // used for ion presentingElement
  pageRef: RefObject<HTMLElement | undefined> | undefined;

  /**
   * @returns true if login dialog was presented
   */
  presentLoginIfNeeded: () => boolean;

  /**
   * @returns comment payload if replied
   */
  presentCommentReply: (
    item: CommentReplyItem,
  ) => Promise<CommentView | undefined>;

  /**
   * Will mutate comment in store, which view should be linked to for updates
   * That's why this does not return anything
   */
  presentCommentEdit: (item: Comment) => void;

  presentReport: (item: ReportableItem) => void;

  /**
   * @param postOrCommunity An existing post to be edited, or the community handle
   * to submit the new post to
   */
  presentPostEditor: (postOrCommunity: PostView | string) => void;

  presentSelectText: (text: string) => void;

  presentShareAsImage: (
    post: PostView,
    comment?: CommentView,
    comments?: CommentView[],
  ) => void;

  presentAccountSwitcher: () => void;
}

export const PageContext = createContext<IPageContext>({
  pageRef: undefined,
  presentLoginIfNeeded: () => false,
  presentCommentReply: async () => undefined,
  presentCommentEdit: () => false,
  presentReport: () => {},
  presentPostEditor: () => {},
  presentSelectText: () => {},
  presentShareAsImage: () => {},
  presentAccountSwitcher: () => {},
});

interface PageContextProvider {
  value: Pick<IPageContext, "pageRef">;
  children: React.ReactNode;
}

export function PageContextProvider({ value, children }: PageContextProvider) {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector(jwtSelector);
  const [presentLogin, onDismissLogin] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismissLogin(data, role),
  });
  const reportRef = useRef<ReportHandle>(null);
  const shareAsImageDataRef = useRef<ShareAsImageData | null>(null);

  const [presentShareAsImageModal, onDismissShareAsImageModal] = useIonModal(
    ShareAsImageModal,
    {
      dataRef: shareAsImageDataRef,
      onDismiss: (data: string, role: string) =>
        onDismissShareAsImageModal(data, role),
    },
  );

  const presentLoginIfNeeded = useCallback(() => {
    if (jwt) return false;

    presentLogin({
      presentingElement: value.pageRef?.current ?? undefined,
    });
    return true;
  }, [jwt, presentLogin, value.pageRef]);

  const presentShareAsImage = useCallback(
    (post: PostView, comment?: CommentView, comments?: CommentView[]) => {
      shareAsImageDataRef.current = {
        post,
      };
      if (comment && comments) {
        shareAsImageDataRef.current = {
          ...shareAsImageDataRef.current,
          comment,
          comments,
        };
      }
      presentShareAsImageModal({
        cssClass: "save-as-image-modal",
        initialBreakpoint: 1,
        breakpoints: [0, 1],
        handle: false,
      });
    },
    [presentShareAsImageModal],
  );

  // Comment reply start
  const commentReplyItem = useRef<CommentReplyItem>();
  const commentReplyCb = useRef<
    ((replied: CommentView | undefined) => void) | undefined
  >();
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const presentCommentReply = useCallback((item: CommentReplyItem) => {
    const promise = new Promise<CommentView | undefined>(
      (resolve) => (commentReplyCb.current = resolve),
    );

    commentReplyItem.current = item;
    setIsReplyOpen(true);

    return promise;
  }, []);

  useEffect(() => {
    if (isReplyOpen) return;

    commentReplyCb.current?.(undefined);
    commentReplyCb.current = undefined;
    return;
  }, [isReplyOpen]);
  // Comment reply end

  // Edit comment start
  const commentEditItem = useRef<Comment>();
  const [isEditCommentOpen, setIsEditCommentOpen] = useState(false);
  const presentCommentEdit = useCallback((item: Comment) => {
    commentEditItem.current = item;
    setIsEditCommentOpen(true);
  }, []);
  // Edit comment end

  // Edit/new post start
  const postItem = useRef<PostView | string>();
  const [isPostOpen, setIsPostOpen] = useState(false);
  const presentPostEditor = useCallback(
    (postOrCommunity: PostView | string) => {
      postItem.current = postOrCommunity;
      setIsPostOpen(true);
    },
    [],
  );
  // Edit/new post end

  // Select text start
  const selectTextItem = useRef<string | string>();
  const [isSelectTextOpen, setIsSelectTextOpen] = useState(false);
  const presentSelectText = useCallback((text: string) => {
    selectTextItem.current = text;
    setIsSelectTextOpen(true);
  }, []);
  // Select text end

  const presentReport = useCallback((item: ReportableItem) => {
    reportRef.current?.present(item);
  }, []);

  const [presentAccountSwitcherModal, onDismissAccountSwitcher] = useIonModal(
    AccountSwitcher,
    {
      onDismiss: (data: string, role: string) =>
        onDismissAccountSwitcher(data, role),
      presentLogin: () =>
        presentLogin({
          presentingElement: value.pageRef?.current ?? undefined,
        }),
      onSelectAccount: (account: string) => dispatch(changeAccount(account)),
    },
  );

  const presentAccountSwitcher = useCallback(() => {
    presentAccountSwitcherModal({ cssClass: "small" });
  }, [presentAccountSwitcherModal]);

  const currentValue = useMemo(
    () => ({
      ...value,
      presentLoginIfNeeded,
      presentCommentReply,
      presentCommentEdit,
      presentReport,
      presentPostEditor,
      presentSelectText,
      presentShareAsImage,
      presentAccountSwitcher,
    }),
    [
      presentCommentEdit,
      presentCommentReply,
      presentLoginIfNeeded,
      presentPostEditor,
      presentReport,
      presentSelectText,
      presentShareAsImage,
      presentAccountSwitcher,
      value,
    ],
  );

  return (
    <PageContext.Provider value={currentValue}>
      {children}

      <CommentReplyModal
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        item={commentReplyItem.current!}
        isOpen={isReplyOpen}
        setIsOpen={setIsReplyOpen}
        onReply={(reply) => {
          commentReplyCb.current?.(reply);
          commentReplyCb.current = undefined;
        }}
      />
      <CommentEditModal
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        item={commentEditItem.current!}
        isOpen={isEditCommentOpen}
        setIsOpen={setIsEditCommentOpen}
      />
      <Report ref={reportRef} />
      <PostEditorModal
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        postOrCommunity={postItem.current!}
        isOpen={isPostOpen}
        setIsOpen={setIsPostOpen}
      />
      <SelectTextModal
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        text={selectTextItem.current!}
        isOpen={isSelectTextOpen}
        setIsOpen={setIsSelectTextOpen}
      />
    </PageContext.Provider>
  );
}
