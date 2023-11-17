import { useAppSelector } from "../../store";
import InAppExternalLink from "../shared/InAppExternalLink";
import Markdown from "../shared/Markdown";
import MarkdownImg from "../shared/MarkdownImg";

interface CommentMarkdownProps {
  children: string;
}

export default function CommentMarkdown({ children }: CommentMarkdownProps) {
  const { showCommentImages } = useAppSelector(
    (state) => state.settings.general.comments,
  );

  return (
    <Markdown
      components={{
        img: (props) =>
          !showCommentImages ? (
            <InAppExternalLink
              href={props.src}
              target="_blank"
              rel="noopener noreferrer"
            >
              {props.alt || "Image"}
            </InAppExternalLink>
          ) : (
            <MarkdownImg small {...props} />
          ),
      }}
    >
      {children}
    </Markdown>
  );
}
