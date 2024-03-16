const MAX_IMAGE_WIDTH = 4000;

import React, {
  ComponentRef,
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
import PhotoSwipeLightbox, { PreparedPhotoSwipeOptions } from "photoswipe";
import { getSafeArea, isAndroid, isNative } from "../../../helpers/device";

import "photoswipe/style.css";
import { useLocation } from "react-router";
import { StatusBar } from "@capacitor/status-bar";
import { setPostRead } from "../../post/postSlice";
import { useAppDispatch } from "../../../store";
import GalleryMedia from "./GalleryMedia";
import ImageMoreActions from "./ImageMoreActions";
import type ZoomLevel from "photoswipe/dist/types/slide/zoom-level";

interface IGalleryContext {
  // used for determining whether page needs to be scrolled up first
  open: (
    img: HTMLImageElement | HTMLCanvasElement,
    src: string,
    post?: PostView,
    animationType?: PreparedPhotoSwipeOptions["showHideAnimationType"],
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

type ThumbEl = ComponentRef<typeof GalleryMedia>;

export default function GalleryProvider({ children }: GalleryProviderProps) {
  const dispatch = useAppDispatch();
  const [actionContainer, setActionContainer] = useState<HTMLElement | null>(
    null,
  );
  const thumbElRef = useRef<ThumbEl>();
  const imgSrcRef = useRef("");
  const [post, setPost] = useState<PostView>();
  const lightboxRef = useRef<PhotoSwipeLightbox | null>(null);
  const location = useLocation();

  useEffect(() => {
    return () => {
      lightboxRef.current?.destroy();
      lightboxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!lightboxRef.current) return;

    lightboxRef.current.close();
  }, [location.pathname]);

  const close = useCallback(() => {
    if (!lightboxRef.current) return;

    lightboxRef.current.options.showHideAnimationType = "fade";
    lightboxRef.current.close();
  }, []);

  const open = useCallback(
    (
      thumbEl: ThumbEl,
      src: string,
      post?: PostView,
      animationType?: PreparedPhotoSwipeOptions["showHideAnimationType"],
    ) => {
      if (lightboxRef.current) return;

      thumbElRef.current = thumbEl;
      imgSrcRef.current = src;
      setPost(post);

      if (thumbEl instanceof HTMLImageElement) {
        const ratio = thumbEl.width / thumbEl.naturalWidth;

        // If thumbnail height is constrained, photoswipe's zoom animation doesn't work
        if (
          animationType === "zoom" &&
          thumbEl.height < thumbEl.naturalHeight * ratio - 1
        )
          animationType = "fade";
      }

      const instance = new PhotoSwipeLightbox({
        dataSource: [
          {
            src,
            height:
              thumbEl instanceof HTMLImageElement
                ? thumbEl.naturalHeight
                : thumbEl.height,
            width:
              thumbEl instanceof HTMLImageElement
                ? thumbEl.naturalWidth
                : thumbEl.width,
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
        secondaryZoomLevel: (zoomLevelObject) => {
          // Fit tall comics

          const width = zoomLevelObject.itemData.width,
            height = zoomLevelObject.itemData.height;

          const deviceWidth = zoomLevelObject.panAreaSize?.x,
            deviceHeight = zoomLevelObject.panAreaSize?.y;

          if (!width || !height || !deviceWidth || !deviceHeight)
            return zoomLevelObject.fill;

          if (width / height < deviceWidth / deviceHeight)
            return zoomLevelObject.fill;

          // Below logic is default photoswipe - https://github.com/dimsemenov/PhotoSwipe/blob/1938a36f5f41821698186e648de3ad24c45a6fd0/src/js/slide/zoom-level.js#L91

          let currZoomLevel = Math.min(1, zoomLevelObject.fit * 3);

          if (
            zoomLevelObject.elementSize &&
            currZoomLevel * zoomLevelObject.elementSize.x > MAX_IMAGE_WIDTH
          ) {
            currZoomLevel = MAX_IMAGE_WIDTH / zoomLevelObject.elementSize.x;
          }

          return currZoomLevel;
        },
      });

      let zoomLevel: ZoomLevel;
      let currZoomLevel = 0;

      instance.on("zoomLevelsUpdate", (e) => {
        zoomLevel = e.zoomLevels;
        if (!currZoomLevel) currZoomLevel = e.zoomLevels.min;
      });

      instance.on("openingAnimationStart", () => {
        if (animationType !== "zoom") return;

        thumbEl.style.setProperty("visibility", "hidden");
      });

      const cleanupHideThumb = () => {
        if (animationType !== "zoom") return;

        thumbEl.style.removeProperty("visibility");
      };

      instance.on("closingAnimationEnd", cleanupHideThumb);

      instance.on("tapAction", () => {
        if (currZoomLevel !== zoomLevel.min) {
          instance.zoomTo(zoomLevel.min, undefined, 300);
          currZoomLevel = zoomLevel.min;

          // queueMicrotask, otherwise will be overwritten by internal photoswipe ui toggle
          queueMicrotask(() => onZoomChange());
        }
      });

      instance.on("zoomPanUpdate", (e) => {
        currZoomLevel = e.slide.currZoomLevel;

        onZoomChange();
      });

      instance.on("beforeZoomTo", (e) => {
        currZoomLevel = e.destZoomLevel;

        onZoomChange();
      });

      function onZoomChange() {
        if (currZoomLevel <= zoomLevel.min) {
          instance.gestures.pswp.element?.classList.add("pswp--ui-visible");
        } else {
          instance.gestures.pswp.element?.classList.remove("pswp--ui-visible");
        }
      }

      instance.addFilter("thumbEl", () => {
        return thumbEl;
      });

      instance.addFilter("placeholderSrc", () => {
        return src;
      });

      instance.on("openingAnimationEnd", () => {
        if (!post) return;

        dispatch(setPostRead(post.post.id));
      });

      instance.on("openingAnimationStart", () => {
        if (isNative()) StatusBar.hide();
      });

      instance.on("close", () => {
        if (isNative()) StatusBar.show();
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
          urlWithoutOpenedSlide,
        );
        // then we need to create new history record to store hash navigation state
        window.history.pushState(
          getHistoryState(),
          document.title,
          urlWithOpenedSlide,
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
          urlWithOpenedSlide,
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
        cleanupHideThumb();
        setPost(undefined);

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
    [dispatch],
  );

  const value = useMemo(() => ({ open, close }), [close, open]);

  return (
    <GalleryContext.Provider value={value}>
      {actionContainer !== null &&
        createPortal(
          post ? (
            thumbElRef.current && (
              <GalleryPostActions post={post} imgSrc={imgSrcRef.current} />
            )
          ) : (
            <ImageMoreActions imgSrc={imgSrcRef.current} />
          ),
          actionContainer,
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
