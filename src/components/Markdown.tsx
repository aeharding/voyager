import {
  ReactMarkdown,
  ReactMarkdownOptions,
} from "react-markdown/lib/react-markdown";
import Img from "./Img";
import styled from "@emotion/styled";

const Blockquote = styled.blockquote`
  padding-left: 0.5rem;
  border-left: 3px solid var(--ion-color-light);
  margin-left: 0.5rem;
`;

export default function Markdown(props: ReactMarkdownOptions) {
  return (
    <ReactMarkdown
      linkTarget="_blank"
      {...props}
      components={{
        img: (props: any) => (
          <Img {...props} onClick={(e) => e.stopPropagation()} />
        ),
        blockquote: (props) => <Blockquote {...props} />,
        ...props.components,
      }}
    />
  );
}
