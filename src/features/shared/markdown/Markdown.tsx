import ReactMarkdown, { Options as ReactMarkdownOptions } from "react-markdown";
import LinkInterceptor from "./LinkInterceptor";
import customRemarkGfm from "./customRemarkGfm";
import MarkdownImg from "./MarkdownImg";
import InAppExternalLink from "../InAppExternalLink";
import { useAppSelector } from "../../../store";
import { css, cx } from "@linaria/core";
import superSub from "remark-supersub";
import Table from "./components/Table";
import spoiler from "@aeharding/remark-lemmy-spoiler";
import { visit } from "unist-util-visit";
import { Root } from "mdast";
import Summary from "./components/spoiler/Summary";
import Details from "./components/spoiler/Details";

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

  hr {
    background-color: var(
      --ion-border-color,
      var(--ion-color-step-250, #c8c7cc)
    );

    min-width: min(100%, 100px);
    width: 80%;

    height: 2px;
  }
`;

export interface MarkdownProps
  extends Omit<ReactMarkdownOptions, "remarkPlugins"> {
  className?: string;

  disableInternalLinkRouting?: boolean;

  /**
   * ID should be unique to the connected instance (prefixed, if 0-based id)
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
        summary: (props) => <Summary {...props} />,
        details: (props) => <Details {...props} id={id} />,
        ...props.components,
      }}
      remarkPlugins={[
        [customRemarkGfm, { connectedInstance }],
        superSub,
        spoiler,
        spoilerRehype,
      ]}
    />
  );
}

function spoilerRehype() {
  return function (tree: Root) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, function (node: any) {
      if (node.type === "spoiler") {
        const data = node.data || (node.data = {});
        data.hName = "details";

        node.children = [
          {
            type: "unknown",
            data: {
              hName: "summary",
            },
            children: [
              {
                type: "text",
                value: node.name,
              },
            ],
          },
          ...node.children,
        ];
      }
    });
  };
}
