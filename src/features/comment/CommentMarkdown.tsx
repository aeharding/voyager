import styled from "@emotion/styled";
import { useAppSelector } from "../../store";
import InAppExternalLink from "../shared/InAppExternalLink";
import Markdown from "../shared/Markdown";

interface CommentMarkdownProps {
  children: string;
}

const StyledCommentMarkdown = styled(Markdown)`
  img {
    max-height: 200px;
  }
`;

export default function CommentMarkdown({ children }: CommentMarkdownProps) {
  const { showCommentImages } = useAppSelector(
    (state) => state.settings.general.comments,
  );

  return (
    <StyledCommentMarkdown
      components={
        !showCommentImages
          ? {
              img: (props) => (
                <InAppExternalLink
                  href={props.src}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {props.alt || "Image"}
                </InAppExternalLink>
              ),
            }
          : undefined
      }
    >
      {children}
    </StyledCommentMarkdown>
  );
}
