import styled from "@emotion/styled";
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import GalleryPostActions from "./GalleryPostActions";
import { createPortal } from "react-dom";
import { PostView } from "lemmy-js-client";
import PhotoSwipeLightbox, { PreparedPhotoSwipeOptions } from "photoswipe";
import { getSafeArea, isAndroid } from "../../helpers/device";

import "photoswipe/style.css";
import { useLocation } from "react-router";
import { useAppDispatch } from "../../store";
import { setPostRead } from "../post/postSlice";

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
    img: HTMLImageElement,
    post?: PostView,
    animationType?: PreparedPhotoSwipeOptions["showHideAnimationType"]
  ) => void;
  close: () => void;
}

export const GalleryContext = createContext<IGalleryContext>({
  open: () => {},
  close: () => {},
});

const galleryHashEnabled = isAndroid();
const OPEN_HASH = "galleryOpen";

interface GalleryProviderProps {
  children: React.ReactNode;
}

export default function GalleryProvider({ children }: GalleryProviderProps) {
  const [actionContainer, setActionContainer] = useState<HTMLElement | null>(
    null
  );
  const [post, setPost] = useState<PostView>();
  const lightboxRef = useRef<PhotoSwipeLightbox | null>(null);
  const location = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    return () => {
      lightboxRef.current?.destroy();
      lightboxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!lightboxRef.current) return;

    lightboxRef.current.destroy();
    lightboxRef.current = null;
  }, [location.pathname]);

  const close = useCallback(() => {
    if (!lightboxRef.current) return;

    lightboxRef.current.close();
  }, []);

  const open = useCallback(
    (
      img: HTMLImageElement,
      post?: PostView,
      animationType?: PreparedPhotoSwipeOptions["showHideAnimationType"]
    ) => {
      if (lightboxRef.current) return;

      setPost(post);

      const instance = new PhotoSwipeLightbox({
        dataSource: [
          {
            src: img.src,
            height: img.naturalHeight,
            width: img.naturalWidth,
          },
        ],
        showHideAnimationType: animationType ?? "fade",
        zoom: false,
        bgOpacity: 1,
        // Put in ion-app element so share IonActionSheet is on top
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        appendToEl: document.querySelector("ion-app")!,
        paddingFn: () => getSafeArea(),
        pswpModule: () => import("photoswipe"),
      });

      instance.addFilter("thumbEl", () => {
        return img;
      });

      instance.addFilter("placeholderSrc", () => {
        return img.src;
      });

      instance.on("openingAnimationEnd", () => {
        if (!post) return;

        dispatch(setPostRead(post.post.id));
      });

      instance.on("closingAnimationEnd", () => setPost(undefined));

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
        if (!galleryHashEnabled) {
          return;
        }

        const hasHash = !!getHashValue();

        // was opened by open() method call (click on thumbnail, for example)
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

          // if hash in URL => this destroy was called with ordinary instance.close() call
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
    },
    [dispatch]
  );

  return (
    <GalleryContext.Provider value={{ open, close }}>
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

function getBaseUrl(): string {
  return `${window.location.pathname}${window.location.search}`;
}

function getHashValue(): string {
  return window.location.hash.substring(1);
}
