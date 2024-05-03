import { useMemo } from "react";
import { useAppSelector } from "../../store";
import InAppExternalLink from "../shared/InAppExternalLink";
import Markdown, { MarkdownProps } from "../shared/markdown/Markdown";
import MarkdownImg from "../shared/markdown/MarkdownImg";

interface CommentMarkdownProps extends Omit<MarkdownProps, "components"> {
  id: string;
}

export default function CommentMarkdown(props: CommentMarkdownProps) {
  const { showCommentImages } = useAppSelector(
    (state) => state.settings.general.comments,
  );

  return (
    <Markdown
      {...props}
      components={useMemo(
        () => ({
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
              <MarkdownImg
                small
                {...props}
                onClick={(e) => e.stopPropagation()}
              />
            ),
        }),
        [showCommentImages],
      )}
    />
  );
}
