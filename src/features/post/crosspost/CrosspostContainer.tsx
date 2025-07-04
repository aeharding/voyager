import { MouseEvent, ReactNode, useEffect } from "react";
import { PostView } from "threadiverse";

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
    const abortCtrl = new AbortController();

    let timeoutId: NodeJS.Timeout | null = setTimeout(() => {
      timeoutId = null;
      if (abortCtrl.signal.aborted) return;

      dispatch(resolveObject(url, abortCtrl.signal));
    }, 250);

    return () => {
      abortCtrl.abort();
      if (timeoutId != null) clearTimeout(timeoutId);
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
