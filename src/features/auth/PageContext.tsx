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
import { useAppDispatch, useAppSelector } from "../../store";
import { changeAccount } from "../auth/authSlice";
import {
  Comment,
  CommentView,
  Community,
  Person,
  PostView,
  PrivateMessageView,
} from "lemmy-js-client";
import Report, { ReportHandle, ReportableItem } from "../report/Report";
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
import GenericMarkdownEditorModal, {
  MarkdownEditorData,
} from "../shared/markdown/editing/modal/GenericMarkdownEditorModal";
import { NewPrivateMessage } from "../shared/markdown/editing/modal/contents/PrivateMessagePage";
import { CommentReplyItem } from "../shared/markdown/editing/modal/contents/CommentReplyPage";

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
   * @returns private message payload if submitted
   */
  presentPrivateMessageCompose: (
    item: NewPrivateMessage,
  ) => Promise<PrivateMessageView | undefined>;

  /**
   * @returns comment payload if replied
   */
  presentCommentEdit: (item: Comment) => Promise<CommentView | undefined>;

  /**
   * @returns comment payload if replied
   */
  presentCommentReply: (
    item: CommentReplyItem,
  ) => Promise<CommentView | undefined>;

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
  presentCommentEdit: async () => undefined,
  presentCommentReply: async () => undefined,
  presentPrivateMessageCompose: async () => undefined,
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

  // Markdown editor start
  const [markdownEditorData, setMarkdownEditorData] = useState<
    MarkdownEditorData | undefined
  >();
  const [isMarkdownEditorOpen, setIsMarkdownEditorOpen] = useState(false);
  const presentMarkdownEditor = useCallback(
    <T extends MarkdownEditorData>(data: Omit<T, "onSubmit">) =>
      new Promise<Parameters<T["onSubmit"]>[0]>((resolve) => {
        setMarkdownEditorData({
          ...data,
          onSubmit: resolve,
        } as T);
        setIsMarkdownEditorOpen(true);
      }),
    [],
  );

  useEffect(() => {
    if (isMarkdownEditorOpen) return;
    if (!markdownEditorData) return;

    markdownEditorData.onSubmit(undefined);
    setMarkdownEditorData(undefined);
    return;
  }, [isMarkdownEditorOpen, markdownEditorData]);

  const presentPrivateMessageCompose = useCallback<
    IPageContext["presentPrivateMessageCompose"]
  >(
    (item) =>
      presentMarkdownEditor({
        type: "PRIVATE_MESSAGE",
        item,
      }) as ReturnType<IPageContext["presentPrivateMessageCompose"]>,
    [presentMarkdownEditor],
  );

  const presentCommentEdit = useCallback<IPageContext["presentCommentEdit"]>(
    (item) =>
      presentMarkdownEditor({
        type: "COMMENT_EDIT",
        item,
      }) as ReturnType<IPageContext["presentCommentEdit"]>,
    [presentMarkdownEditor],
  );

  const presentCommentReply = useCallback<IPageContext["presentCommentReply"]>(
    (item) =>
      presentMarkdownEditor({
        type: "COMMENT_REPLY",
        item,
      }) as ReturnType<IPageContext["presentCommentReply"]>,
    [presentMarkdownEditor],
  );
  // Markdown editor end

  // Edit/new post start
  const [postItem, setPostItem] = useState<PostView | string | undefined>();
  const [isPostOpen, setIsPostOpen] = useState(false);
  const presentPostEditor = useCallback(
    (postOrCommunity: PostView | string) => {
      setPostItem(postOrCommunity);
      setIsPostOpen(true);
    },
    [],
  );
  // Edit/new post end

  // Select text start
  const [selectTextItem, setSelectTextItem] = useState<string | undefined>();
  const [isSelectTextOpen, setIsSelectTextOpen] = useState(false);
  const presentSelectText = useCallback((text: string) => {
    setSelectTextItem(text);
    setIsSelectTextOpen(true);
  }, []);
  // Select text end

  // Ban user start
  const [banItem, setBanItem] = useState<BanUserPayload | undefined>();
  const [isBanUserOpen, setIsBanUserOpen] = useState(false);
  const presentBanUser = useCallback((banUserPayload: BanUserPayload) => {
    setBanItem(banUserPayload);
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

  const [crosspost, setCrosspost] = useState<PostView | undefined>();
  const [presentCrosspost, onDismissCrosspost] = useIonModal(
    CreateCrosspostDialog,
    {
      onDismiss: (data?: string, role?: string) =>
        onDismissCrosspost(data, role),
      post: crosspost!,
    },
  );

  const presentCreateCrosspost = useCallback(
    (post: PostView) => {
      setCrosspost(post);
      presentCrosspost({ cssClass: "transparent-scroll dark" });
    },
    [presentCrosspost],
  );

  const currentValue = useMemo(
    () => ({
      ...value,
      presentLoginIfNeeded,
      presentPrivateMessageCompose,
      presentCommentEdit,
      presentCommentReply,
      presentReport,
      presentPostEditor,
      presentSelectText,
      presentShareAsImage,
      presentAccountSwitcher,
      presentBanUser,
      presentCreateCrosspost,
    }),
    [
      presentPrivateMessageCompose,
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
      <GenericMarkdownEditorModal
        {...markdownEditorData!}
        isOpen={isMarkdownEditorOpen}
        setIsOpen={setIsMarkdownEditorOpen}
      />
      <Report ref={reportRef} />
      <PostEditorModal
        postOrCommunity={postItem!}
        isOpen={isPostOpen}
        setIsOpen={setIsPostOpen}
      />
      <BanUserModal
        item={banItem!}
        isOpen={isBanUserOpen}
        setIsOpen={setIsBanUserOpen}
      />
      <SelectTextModal
        text={selectTextItem!}
        isOpen={isSelectTextOpen}
        setIsOpen={setIsSelectTextOpen}
      />
    </PageContext.Provider>
  );
}
