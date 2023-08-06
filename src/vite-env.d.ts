/* eslint-disable no-undef */
/// <reference types="vite/client" />
/// <reference types="@emotion/react/types/css-prop" />
/// <reference types="vite-plugin-pwa/react" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";

declare const APP_VERSION: string;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "markdown-toolbar": MarkdownToolbarElement;
      "md-header": MarkdownHeaderButtonElement;
      "md-bold": MarkdownBoldButtonElement;
      "md-italic": MarkdownItalicButtonElement;
      "md-quote": MarkdownQuoteButtonElement;
      "md-code": MarkdownCodeButtonElement;
      "md-link": MarkdownLinkButtonElement;
      "md-image": MarkdownImageButtonElement;
      "md-unordered-list": MarkdownUnorderedListButtonElement;
      "md-ordered-list": MarkdownOrderedListButtonElement;
      "md-task-list": MarkdownTaskListButtonElement;
      "md-mention": MarkdownMentionButtonElement;
      "md-ref": MarkdownRefButtonElement;
      "md-strikethrough": MarkdownStrikethroughButtonElement;
    }
  }
}
