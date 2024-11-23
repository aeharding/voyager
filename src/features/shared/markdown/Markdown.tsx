import spoiler from "@aeharding/remark-lemmy-spoiler";
import ReactMarkdown, { Options as ReactMarkdownOptions } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import superSub from "remark-supersub-lemmy";

import { cx } from "#/helpers/css";
import { useAppSelector } from "#/store";

import InAppExternalLink from "../InAppExternalLink";
import LinkInterceptor from "./LinkInterceptor";
import styles from "./Markdown.module.css";
import MarkdownImg from "./MarkdownImg";
import Table from "./components/Table";
import Details from "./components/spoiler/Details";
import Summary from "./components/spoiler/Summary";
import customRemarkGfm from "./customRemarkGfm";

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
      className={cx(props.className, styles.markdown)}
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
