import { useAppSelector } from "../../store";
import InAppExternalLink from "../shared/InAppExternalLink";
import Markdown, { MarkdownProps } from "../shared/Markdown";
import MarkdownImg from "../shared/MarkdownImg";

export default function CommentMarkdown(
  props: Omit<MarkdownProps, "components">,
) {
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
              onClick={(e) => e.stopPropagation()}
              {...props}
            />
          ),
      }}
    />
  );
}
