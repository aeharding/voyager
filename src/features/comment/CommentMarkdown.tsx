import { useAppSelector } from "../../store";
import InAppExternalLink from "../shared/InAppExternalLink";
import Markdown from "../shared/Markdown";

interface CommentMarkdownProps {
  children: string;
}

export default function CommentMarkdown({ children }: CommentMarkdownProps) {
  const { showCommentImages } = useAppSelector(
    (state) => state.settings.general.comments,
  );

  return (
    <Markdown
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
    </Markdown>
  );
}
