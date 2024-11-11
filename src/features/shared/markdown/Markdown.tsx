import spoiler from "@aeharding/remark-lemmy-spoiler";
import { css, cx } from "@linaria/core";
import ReactMarkdown, { Options as ReactMarkdownOptions } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import superSub from "remark-supersub-lemmy";

import { useAppSelector } from "#/store";

import InAppExternalLink from "../InAppExternalLink";
import LinkInterceptor from "./LinkInterceptor";
import MarkdownImg from "./MarkdownImg";
import Table from "./components/Table";
import Details from "./components/spoiler/Details";
import Summary from "./components/spoiler/Summary";
import customRemarkGfm from "./customRemarkGfm";

const markdownCss = css`
  @media (max-width: 700px) {
    ul,
    ol {
      padding-left: 28px;
    }
  }

  code {
    white-space: pre-wrap;
  }

  code:not(.hljs) {
    background: var(--lightroom-bg);
    border-radius: 4px;
    padding: 1px 3px;
    color: rgba(var(--ion-color-dark-rgb), 0.9);
  }

  pre {
    background: var(--lightroom-bg);
    padding: 8px;
    border-radius: 8px;
    font-size: 0.9375em;
  }

  blockquote {
    padding-left: 0.5rem;
    border-left: 3px solid
      var(--ion-border-color, var(--ion-background-color-step-250, #c8c7cc));
    margin-left: 0;
  }

  hr {
    background-color: var(
      --ion-border-color,
      var(--ion-background-color-step-250, #c8c7cc)
    );

    min-width: min(100%, 100px);
    width: 80%;

    height: 2px;
  }

  ol,
  ul {
    li > p:first-child:last-child {
      margin: 0;
    }
  }

  img {
    vertical-align: middle;
  }
`;

// TODO - remove never when upgrading to rehypeHighlight v7
// TODO - ignoreMissing not needed in v7
// Waiting on leak fix - https://github.com/remarkjs/react-markdown/issues/791
const rehypePlugins: import("unified").PluggableList = [
  [rehypeHighlight as never, { detect: true, ignoreMissing: true }],
];

export interface MarkdownProps
  extends Omit<ReactMarkdownOptions, "remarkPlugins"> {
  className?: string;

  disableInternalLinkRouting?: boolean;

  /**
   * ID should be unique (prefixed, if using autoincrement id like lemmy uses)
   * Ideally, just use the `ap_id`
   *
   * This is used so spoilers can track open state
   */
  id: string;
}

export default function Markdown({
  id,
  disableInternalLinkRouting,
  ...props
}: MarkdownProps) {
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  return (
    <ReactMarkdown
      {...props}
      className={cx(props.className, markdownCss)}
      components={{
        img: (props) => (
          <MarkdownImg {...props} onClick={(e) => e.stopPropagation()} />
        ),
        table: Table,
        a: disableInternalLinkRouting
          ? (props) => (
              <InAppExternalLink
                {...props}
                target="_blank"
                rel="noopener noreferrer"
              />
            )
          : (props) => <LinkInterceptor {...props} />,
        summary: Summary,
        details: (props) => <Details {...props} id={id} />,
        ...props.components,
      }}
      remarkPlugins={[
        [customRemarkGfm, { connectedInstance }],
        superSub,
        spoiler,
      ]}
      rehypePlugins={rehypePlugins}
    />
  );
}
