import {
  ReactMarkdown,
  ReactMarkdownOptions,
} from "react-markdown/lib/react-markdown";
import Img from "../post/detail/Img";
import styled from "@emotion/styled";
import remarkGfm from "remark-gfm";

const Blockquote = styled.blockquote`
  padding-left: 0.5rem;
  border-left: 3px solid var(--ion-color-light);
  margin-left: 0;
`;

const Code = styled.code`
  white-space: pre-wrap;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin: 0 -1rem;
  padding: 0 1rem;

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
  return (
    <ReactMarkdown
      linkTarget="_blank"
      {...props}
      components={{
        img: (props) => <Img {...props} onClick={(e) => e.stopPropagation()} />,
        blockquote: (props) => <Blockquote {...props} />,
        code: (props) => <Code {...props} />,
        table: (props) => (
          <TableContainer>
            <table {...props} />
          </TableContainer>
        ),
        ...props.components,
      }}
      remarkPlugins={[remarkGfm]}
    />
  );
}
