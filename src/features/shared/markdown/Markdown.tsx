import ReactMarkdown, { Options as ReactMarkdownOptions } from "react-markdown";
import LinkInterceptor from "./LinkInterceptor";
import customRemarkGfm from "./customRemarkGfm";
import MarkdownImg from "./MarkdownImg";
import InAppExternalLink from "../InAppExternalLink";
import { useAppSelector } from "../../../store";
import { css, cx } from "@linaria/core";
import superSub from "remark-supersub";
import Table from "./components/Table";

const markdownCss = css`
  @media (max-width: 700px) {
    ul,
    ol {
      padding-left: 24px;
    }
  }

  code {
    white-space: pre-wrap;
  }

  blockquote {
    padding-left: 0.5rem;
    border-left: 3px solid var(--ion-color-light);
    margin-left: 0;
  }
`;

export interface MarkdownProps
  extends Omit<ReactMarkdownOptions, "remarkPlugins"> {
  disableInternalLinkRouting?: boolean;
}

export default function Markdown({
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
        ...props.components,
      }}
      remarkPlugins={[[customRemarkGfm, { connectedInstance }], superSub]}
    />
  );
}
