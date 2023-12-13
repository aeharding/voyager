import ReactMarkdown, { Options as ReactMarkdownOptions } from "react-markdown";
import styled from "@emotion/styled";
import { useAppSelector } from "../../store";
import LinkInterceptor from "./markdown/LinkInterceptor";
import buildCommunityPlugin from "./markdown/buildCommunityPlugin";
import customRemarkGfm from "./markdown/customRemarkGfm";
import { useMemo } from "react";
import MarkdownImg from "./MarkdownImg";

const Blockquote = styled.blockquote`
  padding-left: 0.5rem;
  border-left: 3px solid var(--ion-color-light);
  margin-left: 0;
`;

const Code = styled.code`
  white-space: pre-wrap;
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

export default function Markdown(props: ReactMarkdownOptions) {
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  const communityPlugin = useMemo(
    () => buildCommunityPlugin(connectedInstance),
    [connectedInstance],
  );

  return (
    <ReactMarkdown
      {...props}
      components={{
        img: (props) => (
          <MarkdownImg onClick={(e) => e.stopPropagation()} {...props} />
        ),
        blockquote: (props) => <Blockquote {...props} />,
        code: (props) => <Code {...props} />,
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
        a: (props) => <LinkInterceptor {...props} />,
        ...props.components,
      }}
      remarkPlugins={[communityPlugin, customRemarkGfm]}
    />
  );
}
