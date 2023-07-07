import styled from "@emotion/styled";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import GalleryPostActions from "./GalleryPostActions";
import { createPortal } from "react-dom";
import { PostView } from "lemmy-js-client";
import { isUrlImage } from "../../helpers/lemmy";
import { findLoneImage } from "../../helpers/markdown";
import "photoswipe/style.css";
import PhotoSwipeLightbox, { PreparedPhotoSwipeOptions } from "photoswipe";
import { useAppSelector } from "../../store";
import { getSafeArea, isAndroid } from "../../helpers/device";
import { getBaseUrl, getHashValue } from "./galleryHelpers";

const Container = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  padding: 1rem;
  padding-top: 4rem;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0));

  color: white;
  background: linear-gradient(0deg, rgba(0, 0, 0, 1), transparent);
`;

interface IGalleryContext {
  // used for determining whether page needs to be scrolled up first
  open: (
    post: PostView,
    animationType?: PreparedPhotoSwipeOptions["showHideAnimationType"]
  ) => void;
}

export const GalleryContext = createContext<IGalleryContext>({
  open: () => {},
});

const galleryHashEnabled = isAndroid() || true;
const OPEN_HASH = "galleryOpen";

interface GalleryProviderProps {
  children: React.ReactNode;
}

export default function GalleryProvider({ children }: GalleryProviderProps) {
  const imageDimensionsBySrc = useAppSelector(
    (state) => state.gallery.imageDimensionsBySrc
  );
  const [actionContainer, setActionContainer] = useState<HTMLElement | null>(
    null
  );
  const [post, setPost] = useState<PostView>();
  const lightboxRef = useRef<PhotoSwipeLightbox | null>(null);
  const [animationType, setAnimationType] =
    useState<PreparedPhotoSwipeOptions["showHideAnimationType"]>();

  const images = useMemo(() => (post ? getImage(post) : undefined), [post]);

  useEffect(() => {
    if (!images) return;
    if (lightboxRef.current) return;

    const instance = new PhotoSwipeLightbox({
      dataSource: images.map((src) => ({
        src,
        id: post?.post.id,
        ...imageDimensionsBySrc[src],
      })),
      showHideAnimationType: animationType ?? "fade",
      zoom: false,
      bgOpacity: 1,
      // Put in ion-app element so share IonActionSheet is on top
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      appendToEl: document.querySelector("ion-app")!,
      paddingFn: () => getSafeArea(),
      pswpModule: () => import("photoswipe"),
    });

    instance.addFilter("thumbEl", (thumbEl, data) => {
      const el = document.querySelector(
        `.ion-page:not(.ion-page-hidden) [data-photoswipe-id="${data.id}"]`
      );

      if (el instanceof HTMLElement) {
        return el;
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return thumbEl!;
    });

    instance.on("closingAnimationEnd", () => setPost(undefined));

    instance.addFilter("placeholderSrc", (placeholderSrc, slide) => {
      const el = document.querySelector(
        `.ion-page:not(.ion-page-hidden) [data-photoswipe-id="${slide.data.id}"]`
      );
      if (el instanceof HTMLImageElement) {
        return el.src;
      }
      return placeholderSrc;
    });
    instance.on("uiRegister", function () {
      instance.ui?.registerElement({
        appendTo: "root",
        onInit: (el) => {
          setActionContainer(el);
        },
      });
    });

    // -----------------------------
    // Android back button logic start
    const getHistoryState = () => {
      return {
        gallery: {
          open: true,
        },
      };
    };

    instance.on("beforeOpen", () => {
      if (galleryHashEnabled === undefined) {
        return;
      }

      const hasHash = !!getHashValue();

      // was opened by react-photoswipe-gallery's open() method call (click on thumbnail, for example)
      // we need to create new history record to store hash navigation state
      if (!hasHash) {
        window.history.pushState(getHistoryState(), document.title);
        return;
      }

      const hasGalleryStateInHistory = Boolean(window.history.state?.gallery);

      // was openned by history.forward()
      // we do not need to create new history record for hash navigation
      // because we already have one
      if (hasGalleryStateInHistory) {
        return;
      }

      // was openned by link with gid and pid
      const baseUrl = getBaseUrl();
      const currentHash = getHashValue();
      const urlWithoutOpenedSlide = `${baseUrl}`;
      const urlWithOpenedSlide = `${baseUrl}#${currentHash}`;

      // firstly, we need to modify current history record - set url without gid and pid
      // we will return to this state after photoswipe closing
      window.history.replaceState(
        window.history.state,
        document.title,
        urlWithoutOpenedSlide
      );
      // then we need to create new history record to store hash navigation state
      window.history.pushState(
        getHistoryState(),
        document.title,
        urlWithOpenedSlide
      );
    });

    instance.on("change", () => {
      if (!galleryHashEnabled) {
        return;
      }

      const baseUrl = getBaseUrl();
      const urlWithOpenedSlide = `${baseUrl}#${OPEN_HASH}`;
      // updates in current history record hash value with actual pid
      window.history.replaceState(
        getHistoryState(),
        document.title,
        urlWithOpenedSlide
      );
    });

    const closeGalleryOnHistoryPopState = () => {
      if (!galleryHashEnabled) {
        return;
      }

      if (instance !== null) {
        instance.close();
      }
    };

    window.addEventListener("popstate", closeGalleryOnHistoryPopState);

    instance.on("destroy", () => {
      if (galleryHashEnabled) {
        window.removeEventListener("popstate", closeGalleryOnHistoryPopState);

        // if hash includes gid and pid => this destroy was called with ordinary instance.close() call
        // if not => destroy was called by history.back (browser's back button) => history has been already returned to previous state
        if (getHashValue()) {
          window.history.back();
        }
      }
      lightboxRef.current = null;
    });
    // Android back button logic end
    // -----------------------------

    instance.init();
    lightboxRef.current = instance;

    return () => {
      instance.destroy();
      lightboxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);

  const open = useCallback(
    (
      post: PostView,
      animationType?: PreparedPhotoSwipeOptions["showHideAnimationType"]
    ) => {
      setAnimationType(animationType);
      setPost(post);
    },
    []
  );

  return (
    <GalleryContext.Provider value={{ open }}>
      {actionContainer !== null &&
        post &&
        createPortal(
          <Container>
            <GalleryPostActions post={post} />
          </Container>,
          actionContainer
        )}

      {children}
    </GalleryContext.Provider>
  );
}

function getImage(post: PostView): string[] | undefined {
  if (post.post.url && isUrlImage(post.post.url)) return [post.post.url];

  const loneImage = post.post.body && findLoneImage(post.post.body);
  if (loneImage) return [loneImage.url];
}
