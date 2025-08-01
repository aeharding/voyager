import { useIonModal } from "@ionic/react";
import { noop } from "es-toolkit";
import React, { createContext, useRef, useState } from "react";
import {
  Comment,
  CommentView,
  Community,
  Person,
  PostView,
  PrivateMessageView,
} from "threadiverse";

import { changeAccount } from "#/features/auth/authSlice";
import BanUserModal from "#/features/moderation/ban/BanUserModal";
import CreateCrosspostDialog from "#/features/post/crosspost/create/CreateCrosspostDialog";
import PostEditorModal from "#/features/post/new/PostEditorModal";
import Report, { ReportableItem, ReportHandle } from "#/features/report/Report";
import DatabaseErrorModal from "#/features/settings/root/DatabaseErrorModal";
import ShareAsImageModal, {
  ShareAsImageData,
} from "#/features/share/asImage/ShareAsImageModal";
import { CommentReplyItem } from "#/features/shared/markdown/editing/modal/contents/CommentReplyPage";
import { NewPrivateMessage } from "#/features/shared/markdown/editing/modal/contents/PrivateMessagePage";
import GenericMarkdownEditorModal, {
  MarkdownEditorData,
} from "#/features/shared/markdown/editing/modal/GenericMarkdownEditorModal";
import SelectTextModal from "#/features/shared/SelectTextModal";
import UserTagModal from "#/features/tags/UserTagModal";
import { useAppDispatch, useAppSelector } from "#/store";

import AccountSwitcher from "./AccountSwitcher";
import { jwtSelector } from "./authSelectors";
import LoginModal from "./login/LoginModal";

import styles from "./SharedDialogContext.module.css";

export interface BanUserPayload {
  user: Person;
  community: Community;
}

interface ISharedDialogContext {
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

  presentUserTag: (person: Person, sourceUrl?: string) => void;

  presentDatabaseErrorModal: (automatic?: boolean) => void;
}

export const SharedDialogContext = createContext<ISharedDialogContext>({
  presentLoginIfNeeded: () => false,
  presentCommentEdit: async () => undefined,
  presentCommentReply: async () => undefined,
  presentPrivateMessageCompose: async () => undefined,
  presentReport: noop,
  presentPostEditor: noop,
  presentSelectText: noop,
  presentShareAsImage: noop,
  presentAccountSwitcher: noop,
  presentBanUser: noop,
  presentCreateCrosspost: noop,
  presentUserTag: noop,
  presentDatabaseErrorModal: noop,
});

export function SharedDialogContextProvider({
  children,
}: React.PropsWithChildren) {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector(jwtSelector);
  const reportRef = useRef<ReportHandle>(undefined);
  const [shareAsImageData, setShareAsImageData] =
    useState<ShareAsImageData | null>(null);

  const [presentShareAsImageModal, onDismissShareAsImageModal] = useIonModal(
    ShareAsImageModal,
    {
      data: shareAsImageData,
      onDismiss: (data?: string, role?: string) =>
        onDismissShareAsImageModal(data, role),
    },
  );

  const didDatabaseModalOpenRef = useRef(false);
  const [_presentDatabaseErrorModal] = useIonModal(DatabaseErrorModal);

  const presentDatabaseErrorModal = (automatic = false) => {
    if (didDatabaseModalOpenRef.current && automatic) return;
    didDatabaseModalOpenRef.current = true;

    _presentDatabaseErrorModal({
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      cssClass: styles.autoHeight,
    });
  };

  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const presentLoginIfNeeded = () => {
    if (jwt) return false;

    setIsLoginOpen(true);
    return true;
  };

  const presentShareAsImage = (
    post: PostView,
    comment?: CommentView,
    comments?: CommentView[],
  ) => {
    if (comment && comments) {
      setShareAsImageData({
        post,
        comment,
        comments,
      });
    } else {
      setShareAsImageData({ post });
    }
    presentShareAsImageModal({
      cssClass: "save-as-image-modal",
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: false,
    });
  };

  // Markdown editor start
  const [markdownEditorData, setMarkdownEditorData] = useState<
    MarkdownEditorData | undefined
  >();
  const [isMarkdownEditorOpen, setIsMarkdownEditorOpen] = useState(false);
  const presentMarkdownEditor = <T extends MarkdownEditorData>(
    data: Omit<T, "onSubmit">,
  ) =>
    new Promise<Parameters<T["onSubmit"]>[0]>((resolve) => {
      setMarkdownEditorData({
        ...data,
        onSubmit: resolve,
      } as T);
      setIsMarkdownEditorOpen(true);
    });

  function handleMarkdownEditorClose() {
    if (!markdownEditorData) return;

    markdownEditorData.onSubmit(undefined);
    setMarkdownEditorData(undefined);
  }

  function handleSetIsMarkdownEditorOpen(isOpen: boolean) {
    setIsMarkdownEditorOpen(isOpen);

    // If was open and now closed
    if (!isOpen && isMarkdownEditorOpen !== isOpen) handleMarkdownEditorClose();
  }

  const presentPrivateMessageCompose: ISharedDialogContext["presentPrivateMessageCompose"] =
    (item) =>
      presentMarkdownEditor({
        type: "PRIVATE_MESSAGE",
        item,
      }) as ReturnType<ISharedDialogContext["presentPrivateMessageCompose"]>;

  const presentCommentEdit: ISharedDialogContext["presentCommentEdit"] = (
    item,
  ) =>
    presentMarkdownEditor({
      type: "COMMENT_EDIT",
      item,
    }) as ReturnType<ISharedDialogContext["presentCommentEdit"]>;

  const presentCommentReply: ISharedDialogContext["presentCommentReply"] = (
    item,
  ) =>
    presentMarkdownEditor({
      type: "COMMENT_REPLY",
      item,
    }) as ReturnType<ISharedDialogContext["presentCommentReply"]>;
  // Markdown editor end

  // Edit/new post start
  const [postItem, setPostItem] = useState<PostView | string | undefined>();
  const [isPostOpen, setIsPostOpen] = useState(false);
  const presentPostEditor = (postOrCommunity: PostView | string) => {
    setPostItem(postOrCommunity);
    setIsPostOpen(true);
  };
  // Edit/new post end

  // Select text start
  const [selectTextItem, setSelectTextItem] = useState<string | undefined>();
  const [isSelectTextOpen, setIsSelectTextOpen] = useState(false);
  const presentSelectText = (text: string) => {
    setSelectTextItem(text);
    setIsSelectTextOpen(true);
  };
  // Select text end

  // Ban user start
  const [banItem, setBanItem] = useState<BanUserPayload | undefined>();
  const [isBanUserOpen, setIsBanUserOpen] = useState(false);
  const presentBanUser = (banUserPayload: BanUserPayload) => {
    setBanItem(banUserPayload);
    setIsBanUserOpen(true);
  };
  // Ban user end

  // User tag start
  const [userTagPerson, setUserTagPerson] = useState<Person | undefined>();
  const [userTagSourceUrl, setUserTagSourceUrl] = useState<
    string | undefined
  >();
  const [isUserTagOpen, setIsUserTagOpen] = useState(false);
  const presentUserTag = (person: Person, sourceUrl?: string) => {
    setUserTagPerson(person);
    setUserTagSourceUrl(sourceUrl);
    setIsUserTagOpen(true);
  };
  // User tag end

  const presentReport = (item: ReportableItem) => {
    reportRef.current?.present(item);
  };

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

  const presentAccountSwitcher = () => {
    presentAccountSwitcherModal({ cssClass: "small" });
  };

  const [crosspost, setCrosspost] = useState<PostView | undefined>();
  const [presentCrosspost, onDismissCrosspost] = useIonModal(
    CreateCrosspostDialog,
    {
      onDismiss: (data?: string, role?: string) =>
        onDismissCrosspost(data, role),
      post: crosspost!,
    },
  );

  const presentCreateCrosspost = (post: PostView) => {
    setCrosspost(post);
    presentCrosspost({ cssClass: "transparent-scroll dark" });
  };

  return (
    <SharedDialogContext
      value={{
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
        presentUserTag,
        presentDatabaseErrorModal,
      }}
    >
      {children}

      <LoginModal isOpen={isLoginOpen} setIsOpen={setIsLoginOpen} />
      <GenericMarkdownEditorModal
        {...markdownEditorData!}
        isOpen={isMarkdownEditorOpen}
        setIsOpen={handleSetIsMarkdownEditorOpen}
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
      <UserTagModal
        person={userTagPerson!}
        sourceUrl={userTagSourceUrl!}
        isOpen={isUserTagOpen}
        setIsOpen={setIsUserTagOpen}
      />
    </SharedDialogContext>
  );
}
