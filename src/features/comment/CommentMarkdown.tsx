import { buildMediaId } from "#/features/media/video/VideoPortalProvider";
import InAppExternalLink from "#/features/shared/InAppExternalLink";
import Markdown, { MarkdownProps } from "#/features/shared/markdown/Markdown";
import MarkdownImg from "#/features/shared/markdown/MarkdownImg";
import { useAppSelector } from "#/store";

interface CommentMarkdownProps extends Omit<MarkdownProps, "components"> {
  id: string;
}

export default function CommentMarkdown(mdProps: CommentMarkdownProps) {
  const { showCommentImages } = useAppSelector(
    (state) => state.settings.general.comments,
  );

  return (
    <Markdown
      {...mdProps}
      components={{
        img: (props) =>
          !showCommentImages ? (
            <InAppExternalLink
              // @ts-expect-error React experimental change...
              href={props.src}
              target="_blank"
              rel="noopener noreferrer"
            >
              {props.alt || "Image"}
            </InAppExternalLink>
          ) : (
            // @ts-expect-error React experimental change...
            <MarkdownImg
              small
              {...props}
              portalWithMediaId={buildMediaId(
                mdProps.id,
                props.node?.position?.start?.offset,
              )}
              onClick={(e) => e.stopPropagation()}
            />
          ),
      }}
    />
  );
}
