import styled from "@emotion/styled";
import Video from "./Video";
import { useMemo, useRef, useState } from "react";
import { findLoneImage } from "../../helpers/markdown";
import { PostView } from "lemmy-js-client";
import {
  isUrlImage,
  isUrlVideo,
  isUrlVideoEmbed,
  transformUrl,
} from "../../helpers/url";
import { Image } from "../post/inFeed/large/Image";

// Render video embeds with a 16/9 aspect ratio
const VideoEmbed = styled.div`
  width: 100%;
  height: 0px;
  position: relative;
  padding-bottom: 56.818%;
  max-height: 50vh;

  iframe {
    width: 100%;
    height: 100%;
    position: absolute;
  }
`;

interface MediaProps {
  post: PostView;
  onError: () => void;
  detail?: boolean;
  blur?: boolean;
}

const Media = ({ post, detail = false, blur = true, onError }: MediaProps) => {
  const postUrl = transformUrl(post.post.url || "");
  const embedVideoUrl = transformUrl(post.post.embed_video_url || "");
  const thumbnailUrl = transformUrl(post.post.thumbnail_url || "");
  const [url, setUrl] = useState(embedVideoUrl || postUrl);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const isImage = isUrlImage(url as string);
  const isVideo = isUrlVideo(url as string);
  const isVideoEmbed = isUrlVideoEmbed(url as string);

  const markdownLoneImage = useMemo(
    () => (post?.post.body ? findLoneImage(post.post.body) : undefined),
    [post],
  );

  const handleMediaError = () => {
    // Cycle the video url before throwing an error
    if (isVideo && url === embedVideoUrl) {
      return setUrl(postUrl);
    }

    // Cycle the image url before throwing an error
    if (isImage && url === postUrl) {
      return setUrl(thumbnailUrl);
    }

    onError();
  };

  if (!url) {
    return;
  }

  // Change the url as we need
  const postWithUrl = { ...post, post: { ...post.post, url: url } };

  if (postUrl && isUrlImage(postUrl)) {
    return (
      <Image
        blur={blur}
        post={postWithUrl}
        animationType="zoom"
        onError={handleMediaError}
      />
    );
  }

  if (isVideo) {
    return (
      <Video
        src={url}
        blur={blur}
        controls={detail}
        onError={handleMediaError}
      />
    );
  }

  if (isVideoEmbed) {
    return (
      <VideoEmbed>
        <iframe
          ref={iframeRef}
          src={url}
          frameBorder="0"
          width="100%"
          height="100%"
          allowFullScreen
        />
      </VideoEmbed>
    );
  }

  if (markdownLoneImage)
    return (
      <Image
        blur={blur}
        post={postWithUrl}
        animationType="zoom"
        onError={handleMediaError}
      />
    );
};

export default Media;
