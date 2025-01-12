/// <reference types="react/experimental" />
import "@github/markdown-toolbar-element";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "markdown-toolbar": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElementTagNameMap["markdown-toolbar"]> & {
          for: string;
        },
        HTMLElementTagNameMap["markdown-toolbar"]
      >;
      "md-header": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElementTagNameMap["md-header"]>,
        HTMLElementTagNameMap["md-header"]
      >;
      "md-bold": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElementTagNameMap["md-bold"]>,
        HTMLElementTagNameMap["md-bold"]
      >;
      "md-italic": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElementTagNameMap["md-italic"]>,
        HTMLElementTagNameMap["md-italic"]
      >;
      "md-quote": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElementTagNameMap["md-quote"]>,
        HTMLElementTagNameMap["md-quote"]
      >;
      "md-code": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElementTagNameMap["md-code"]>,
        HTMLElementTagNameMap["md-code"]
      >;
      "md-link": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElementTagNameMap["md-link"]>,
        HTMLElementTagNameMap["md-link"]
      >;
      "md-image": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElementTagNameMap["md-image"]>,
        HTMLElementTagNameMap["md-image"]
      >;
      "md-unordered-list": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElementTagNameMap["md-unordered-list"]>,
        HTMLElementTagNameMap["md-unordered-list"]
      >;
      "md-ordered-list": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElementTagNameMap["md-ordered-list"]>,
        HTMLElementTagNameMap["md-ordered-list"]
      >;
      "md-task-list": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElementTagNameMap["md-task-list"]>,
        HTMLElementTagNameMap["md-task-list"]
      >;
      "md-mention": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElementTagNameMap["md-mention"]>,
        HTMLElementTagNameMap["md-mention"]
      >;
      "md-ref": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElementTagNameMap["md-ref"]>,
        HTMLElementTagNameMap["md-ref"]
      >;
      "md-strikethrough": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElementTagNameMap["md-strikethrough"]>,
        HTMLElementTagNameMap["md-strikethrough"]
      >;
    }
  }
}
