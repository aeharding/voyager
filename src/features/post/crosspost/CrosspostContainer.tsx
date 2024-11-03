import { PostView } from "lemmy-js-client";
import { MouseEvent, ReactNode, useEffect } from "react";

import { useAutohidePostIfNeeded } from "#/features/feed/PageTypeContext";
import { resolveObject } from "#/features/resolve/resolveSlice";
import LinkInterceptor from "#/features/shared/markdown/LinkInterceptor";
import { useAppDispatch, useAppSelector } from "#/store";

import { setPostRead } from "../postSlice";

interface CrosspostProps {
  post: PostView;
  url: string;
  className?: string;
  el?: "div";
  children: (props: {
    crosspost: PostView | undefined;
    hasBeenRead: boolean;
  }) => ReactNode;
}

export default function CrosspostContainer({
  post,
  url,
  className,
  el,
  children,
}: CrosspostProps) {
  const dispatch = useAppDispatch();
  const autohidePostIfNeeded = useAutohidePostIfNeeded();

  const object = useAppSelector((state) => state.resolve.objectByUrl[url]);
  const crosspost = typeof object === "object" ? object.post : undefined;

  const hasBeenRead: boolean = useAppSelector((state) =>
    crosspost
      ? state.post.postReadById[crosspost.post.id] || crosspost.read
      : false,
  );

  useEffect(() => {
    if (object) return;

    // Virtua initially tries to render all feed items,
    // so do a poor man's debounce

    let visible = true;

    setTimeout(() => {
      if (!visible) return;

      dispatch(resolveObject(url));
    }, 250);

    return () => {
      visible = false;
    };
  }, [url, dispatch, object]);

  const handleLinkClick = (e: MouseEvent) => {
    e.stopPropagation();

    if (crosspost) dispatch(setPostRead(crosspost.post.id));

    dispatch(setPostRead(post.post.id));
    autohidePostIfNeeded(post);
  };

  return (
    <LinkInterceptor
      el={el}
      href={url}
      forceResolveObject
      onClick={handleLinkClick}
      className={`cross-post ${hasBeenRead ? "read" : ""} ${className}`}
      draggable="false"
    >
      {children({ crosspost, hasBeenRead })}
    </LinkInterceptor>
  );
}
