// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import "@github/markdown-toolbar-element";

type CustomElement<T> = Partial<T & DOMAttributes<T> & { children: unknown }>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "markdown-toolbar": CustomElement<
        HTMLElementTagNameMap["markdown-toolbar"]
      >;
      "md-header": CustomElement<HTMLElementTagNameMap["md-header"]>;
      "md-bold": CustomElement<HTMLElementTagNameMap["md-bold"]>;
      "md-italic": CustomElement<HTMLElementTagNameMap["md-italic"]>;
      "md-quote": CustomElement<HTMLElementTagNameMap["md-quote"]>;
      "md-code": CustomElement<HTMLElementTagNameMap["md-code"]>;
      "md-link": CustomElement<HTMLElementTagNameMap["md-link"]>;
      "md-image": CustomElement<HTMLElementTagNameMap["md-image"]>;
      "md-unordered-list": CustomElement<
        HTMLElementTagNameMap["md-unordered-list"]
      >;
      "md-ordered-list": CustomElement<
        HTMLElementTagNameMap["md-ordered-list"]
      >;
      "md-task-list": CustomElement<HTMLElementTagNameMap["md-task-list"]>;
      "md-mention": CustomElement<HTMLElementTagNameMap["md-mention"]>;
      "md-ref": CustomElement<HTMLElementTagNameMap["md-ref"]>;
      "md-strikethrough": CustomElement<
        HTMLElementTagNameMap["md-strikethrough"]
      >;
    }
  }
}
