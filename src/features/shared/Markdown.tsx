import ReactMarkdown, { Options as ReactMarkdownOptions } from "react-markdown";
import LinkInterceptor from "./markdown/LinkInterceptor";
import customRemarkGfm from "./markdown/customRemarkGfm";
import MarkdownImg from "./MarkdownImg";
import InAppExternalLink from "./InAppExternalLink";
import { useAppSelector } from "../../store";
import { css, cx } from "@linaria/core";
import { styled } from "@linaria/react";
import superSub from "remark-supersub";

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

const TableContainer = styled.div`
  display: inline-flex;
  overflow-x: auto;
  margin: 0 -1rem;
  padding: 0 1rem;
  max-width: calc(100% + 2rem);

  tbody {
    border-collapse: collapse;
  }
  td,
  th {
    padding: 4px;
  }
  td {
    border: 1px solid var(--ion-color-light);
  }
  tr:first-child td {
    border-top: 0;
  }
  tr td:first-child {
    border-left: 0;
  }
  tr:last-child td {
    border-bottom: 0;
  }
  tr td:last-child {
    border-right: 0;
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
        table: (props) => (
          <TableContainer>
            <table
              {...props}
              // Prevent swiping item to allow scrolling table
              onTouchMoveCapture={(e) => {
                e.stopPropagation();
                return true;
              }}
            />
          </TableContainer>
        ),
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
