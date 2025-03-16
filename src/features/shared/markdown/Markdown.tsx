import spoiler from "@aeharding/remark-lemmy-spoiler";
import ReactMarkdown, { Options as ReactMarkdownOptions } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import superSub from "remark-supersub-lemmy";

import { cx } from "#/helpers/css";
import { useAppSelector } from "#/store";

import InAppExternalLink from "../InAppExternalLink";
import Details from "./components/spoiler/Details";
import Summary from "./components/spoiler/Summary";
import Table from "./components/Table";
import customRemarkGfm from "./customRemarkGfm";
import LinkInterceptor from "./LinkInterceptor";
import MarkdownImg from "./MarkdownImg";

import styles from "./Markdown.module.css";

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
  className,
  ...props
}: MarkdownProps) {
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  return (
    <div className={cx(className, styles.markdown)}>
      <ReactMarkdown
        {...props}
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
        rehypePlugins={[[rehypeHighlight, { detect: true }]]}
      />
    </div>
  );
}
