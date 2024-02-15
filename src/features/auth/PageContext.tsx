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
import { useAppDispatch, useAppSelector } from "../../store";
import { changeAccount } from "../auth/authSlice";
import CommentReplyModal from "../comment/compose/reply/CommentReplyModal";
import {
  Comment,
  CommentView,
  Community,
  Person,
  PostView,
} from "lemmy-js-client";
import CommentEditModal from "../comment/compose/edit/CommentEditModal";
import { Report, ReportHandle, ReportableItem } from "../report/Report";
import PostEditorModal from "../post/new/PostEditorModal";
import SelectTextModal from "../shared/SelectTextModal";
import ShareAsImageModal, {
  ShareAsImageData,
} from "../share/asImage/ShareAsImageModal";
import AccountSwitcher from "./AccountSwitcher";
import { jwtSelector } from "./authSelectors";
import BanUserModal from "../moderation/ban/BanUserModal";
import CreateCrosspostDialog from "../post/crosspost/create/CreateCrosspostDialog";
import LoginModal from "./login/LoginModal";

export interface BanUserPayload {
  user: Person;
  community: Community;
}

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

  presentBanUser: (payload: BanUserPayload) => void;

  presentCreateCrosspost: (post: PostView) => void;
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
  presentBanUser: () => {},
  presentCreateCrosspost: () => {},
});

interface PageContextProvider {
  value: Pick<IPageContext, "pageRef">;
  children: React.ReactNode;
}

export function PageContextProvider({ value, children }: PageContextProvider) {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector(jwtSelector);
  const reportRef = useRef<ReportHandle>(null);
  const shareAsImageDataRef = useRef<ShareAsImageData | null>(null);

  const [presentShareAsImageModal, onDismissShareAsImageModal] = useIonModal(
    ShareAsImageModal,
    {
      dataRef: shareAsImageDataRef,
      onDismiss: (data?: string, role?: string) =>
        onDismissShareAsImageModal(data, role),
    },
  );

  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const presentLoginIfNeeded = useCallback(() => {
    if (jwt) return false;

    setIsLoginOpen(true);
    return true;
  }, [jwt]);

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

  // Ban user start
  const banItem = useRef<BanUserPayload>();
  const [isBanUserOpen, setIsBanUserOpen] = useState(false);
  const presentBanUser = useCallback((banUserPayload: BanUserPayload) => {
    banItem.current = banUserPayload;
    setIsBanUserOpen(true);
  }, []);
  // Ban user end

  const presentReport = useCallback((item: ReportableItem) => {
    reportRef.current?.present(item);
  }, []);

  const [presentAccountSwitcherModal, onDismissAccountSwitcher] = useIonModal(
    AccountSwitcher,
    {
      onDismiss: (data?: string, role?: string) =>
        onDismissAccountSwitcher(data, role),
      presentLogin: () => {
        onDismissAccountSwitcher();
        setIsLoginOpen(true);
      },
      onSelectAccount: (account: string) => dispatch(changeAccount(account)),
    },
  );

  const presentAccountSwitcher = useCallback(() => {
    presentAccountSwitcherModal({ cssClass: "small" });
  }, [presentAccountSwitcherModal]);

  const crosspost = useRef<PostView | undefined>();
  const [presentCrosspost, onDismissCrosspost] = useIonModal(
    CreateCrosspostDialog,
    {
      onDismiss: (data?: string, role?: string) =>
        onDismissCrosspost(data, role),
      post: crosspost.current!,
    },
  );

  const presentCreateCrosspost = useCallback(
    (post: PostView) => {
      crosspost.current = post;
      presentCrosspost({ cssClass: "transparent-scroll dark" });
    },
    [presentCrosspost],
  );

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
      presentBanUser,
      presentCreateCrosspost,
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
      presentBanUser,
      presentCreateCrosspost,
      value,
    ],
  );

  return (
    <PageContext.Provider value={currentValue}>
      {children}

      <LoginModal isOpen={isLoginOpen} setIsOpen={setIsLoginOpen} />
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
      <BanUserModal
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        item={banItem.current!}
        isOpen={isBanUserOpen}
        setIsOpen={setIsBanUserOpen}
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
