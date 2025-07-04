import type { FederatedInstances } from "threadiverse";

export interface IPostMetadata {
  post_id: number;
  user_handle: string;

  hidden: 0 | 1; // Not boolean because dexie doesn't support booleans for indexes

  hidden_updated_at?: number;
}

export interface InstanceData {
  data: FederatedInstances;
  domain: string;
  updated: Date;
}

export const OAppThemeType = {
  Default: "default",
  FieryMario: "mario",
  Pistachio: "pistachio",
  SpookyPumpkin: "pumpkin",
  UV: "uv",
  Mint: "mint",
  Dracula: "dracula",
  Tangerine: "tangerine",
  Sunset: "sunset",
  Outrun: "outrun",
} as const;

export type AppThemeType = (typeof OAppThemeType)[keyof typeof OAppThemeType];

export const OCommentsThemeType = {
  Rainbow: "rainbow",
  UnoReverse: "uno-reverse",
  Pastel: "pastel",
  Mauve: "mauve",
  Electric: "electric",
  Citrus: "citrus",
  Blush: "blush",
} as const;

export type CommentsThemeType =
  (typeof OCommentsThemeType)[keyof typeof OCommentsThemeType];

export const OVotesThemeType = {
  Lemmy: "lemmy",
  Reddit: "reddit",
} as const;

export type VotesThemeType =
  (typeof OVotesThemeType)[keyof typeof OVotesThemeType];

export const OPostAppearanceType = {
  Compact: "compact",
  Large: "large",
} as const;

export type PostAppearanceType =
  (typeof OPostAppearanceType)[keyof typeof OPostAppearanceType];

export const OCompactThumbnailPositionType = {
  Left: "left",
  Right: "right",
} as const;

export type CompactThumbnailPositionType =
  (typeof OCompactThumbnailPositionType)[keyof typeof OCompactThumbnailPositionType];

export const OCompactThumbnailSizeType = {
  Hidden: "hidden",

  /**
   * Default
   */
  Small: "small",

  Medium: "medium",
  Large: "large",
} as const;

export type CompactThumbnailSizeType =
  (typeof OCompactThumbnailSizeType)[keyof typeof OCompactThumbnailSizeType];

export const OCommentThreadCollapse = {
  Never: "never",
  RootOnly: "root_only",
  All: "all",
} as const;

export type CommentThreadCollapse =
  (typeof OCommentThreadCollapse)[keyof typeof OCommentThreadCollapse];

export const OPostBlurNsfw = {
  InFeed: "in_feed",
  Never: "never",
} as const;

export type PostBlurNsfwType =
  (typeof OPostBlurNsfw)[keyof typeof OPostBlurNsfw];

export const OInstanceUrlDisplayMode = {
  WhenRemote: "when-remote",
  Never: "never",
} as const;

export type InstanceUrlDisplayMode =
  (typeof OInstanceUrlDisplayMode)[keyof typeof OInstanceUrlDisplayMode];

export const OVoteDisplayMode = {
  /**
   * Show upvotes and downvotes separately
   */
  Separate: "separate",

  /**
   * Show total score (upvotes + downvotes)
   */
  Total: "total",

  /**
   * Hide scores
   */
  Hide: "hide",
} as const;

export type VoteDisplayMode =
  (typeof OVoteDisplayMode)[keyof typeof OVoteDisplayMode];

export const OProfileLabelType = {
  /**
   * e.g. aeharding@lemmy.world
   */
  Handle: "handle",

  /**
   * e.g. aeharding
   */
  Username: "username",

  /**
   * e.g. lemmy.world
   */
  Instance: "instance",

  /**
   * e.g. Profile
   */
  Hide: "hide",
} as const;

export type LinkHandlerType =
  (typeof OLinkHandlerType)[keyof typeof OLinkHandlerType];

export const OLinkHandlerType = {
  DefaultBrowser: "default-browser",
  InApp: "in-app",
} as const;

export type ShowSubscribedIcon =
  (typeof OShowSubscribedIcon)[keyof typeof OShowSubscribedIcon];

export const OShowSubscribedIcon = {
  Never: "never",
  OnlyAllLocal: "all-local",
  Everywhere: "everywhere",
} as const;

export type DefaultFeedType =
  | {
      type:
        | typeof ODefaultFeedType.All
        | typeof ODefaultFeedType.Home
        | typeof ODefaultFeedType.Local
        | typeof ODefaultFeedType.CommunityList
        | typeof ODefaultFeedType.Moderating;
    }
  | {
      type: typeof ODefaultFeedType.Community;

      /**
       * Community handle. If remote, "community@instance.com".
       * If local, "community"
       */
      name: string;
    };

export const ODefaultFeedType = {
  Home: "home",
  All: "all",
  Local: "local",
  Moderating: "moderating",
  CommunityList: "community-list",
  Community: "community",
} as const;

export type JumpButtonPositionType =
  (typeof OJumpButtonPositionType)[keyof typeof OJumpButtonPositionType];

export const OJumpButtonPositionType = {
  LeftTop: "left-top",
  LeftMiddle: "left-middle",
  LeftBottom: "left-bottom",
  Center: "center",
  RightTop: "right-top",
  RightMiddle: "right-middle",
  RightBottom: "right-bottom",
} as const;

export type TapToCollapseType =
  (typeof OTapToCollapseType)[keyof typeof OTapToCollapseType];

export const OTapToCollapseType = {
  OnlyComments: "only-comments",
  OnlyHeaders: "only-headers",
  Both: "both",
  Neither: "neither",
} as const;

export type AutoplayMediaType =
  (typeof OAutoplayMediaType)[keyof typeof OAutoplayMediaType];

export const OAutoplayMediaType = {
  WifiOnly: "wifi-only",
  Always: "always",
  Never: "never",
} as const;

export type ProfileLabelType =
  (typeof OProfileLabelType)[keyof typeof OProfileLabelType];

export const OTwoColumnLayout = {
  On: "on",
  LandscapeOnly: "landscape-only",
  Off: "off",
} as const;

export type TwoColumnLayout =
  (typeof OTwoColumnLayout)[keyof typeof OTwoColumnLayout];

export const OLongSwipeTriggerPointType = {
  Normal: "normal",
  Later: "later",
} as const;

export type LongSwipeTriggerPointType =
  (typeof OLongSwipeTriggerPointType)[keyof typeof OLongSwipeTriggerPointType];

const OSwipeActionBase = {
  None: "none",
  Upvote: "upvote",
  Downvote: "downvote",
  Reply: "reply",
  Save: "save",
  Share: "share",
} as const;

export const OSwipeActionPost = {
  ...OSwipeActionBase,
  Hide: "hide",
} as const;

export const OSwipeActionComment = {
  ...OSwipeActionBase,
  CollapseToTop: "collapse-to-top",
  Collapse: "collapse",
} as const;

export const OSwipeActionInbox = {
  ...OSwipeActionBase,
  MarkUnread: "mark-unread",
} as const;

export const OSwipeActionAll = {
  ...OSwipeActionPost,
  ...OSwipeActionComment,
  ...OSwipeActionInbox,
} as const;

export type SwipeAction =
  (typeof OSwipeActionAll)[keyof typeof OSwipeActionAll];

export type SwipeDirection = "farStart" | "start" | "end" | "farEnd";
export type SwipeActions = Record<SwipeDirection, SwipeAction>;

export type Provider = "redgifs";

interface ProviderData<Name extends string, Data> {
  name: Name;

  data: Data;
}

export type RedgifsProvider = ProviderData<"redgifs", { token: string }>;

export type ProvidersData = RedgifsProvider;

export interface UserTag {
  handle: string;

  downvotes: number;
  upvotes: number;

  text?: string;

  color?: string;

  /**
   * The URL of the Lemmy post or comment this tag was created from.
   * (Will only be set if `saveSource` is enabled.)
   */
  sourceUrl?: string;
}

export const OPostCommentShareType = {
  DeepLink: "deep-link",
  Threadiverse: "threadiverse",
  Local: "local",
  Community: "community",
  ApId: "ap-id",
  Ask: "ask",
} as const;

export type PostCommentShareType =
  (typeof OPostCommentShareType)[keyof typeof OPostCommentShareType];
