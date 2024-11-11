import InAppExternalLink from "#/features/shared/InAppExternalLink";
import Markdown, { MarkdownProps } from "#/features/shared/markdown/Markdown";
import MarkdownImg from "#/features/shared/markdown/MarkdownImg";
import { useAppSelector } from "#/store";

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
            <MarkdownImg
              small
              {...props}
              onClick={(e) => e.stopPropagation()}
            />
          ),
      }}
    />
  );
}
