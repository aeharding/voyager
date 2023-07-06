import React, {
  FocusEvent,
  KeyboardEvent,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Gallery as PhotoswipeGallery, Item } from "react-photoswipe-gallery";

import "photoswipe/dist/photoswipe.css";
import { createPortal } from "react-dom";
import styled from "@emotion/styled";
import PhotoSwipe, { PreparedPhotoSwipeOptions } from "photoswipe";
import { getSafeArea } from "../../helpers/device";
import { v4 as uuidv4 } from "uuid";

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
interface ImgProps {
  src?: string;
  alt?: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLImageElement>;
  footer?: React.ReactElement;
  animationType?: PreparedPhotoSwipeOptions["showHideAnimationType"];
}

export type GalleryHandle = {
  close: () => void;
};

/**
 * TODO: photoswipe traps focus, so onFocusCapture and onKeyDown is a hack to prevent it
 * from detecting that we're changing focus. It's not great.. but it's what we got
 * https://github.com/dimsemenov/PhotoSwipe/issues/1968
 */
export const preventPhotoswipeGalleryFocusTrap = {
  onFocusCapture: (e: FocusEvent) => e.stopPropagation(),
  onKeyDown: (e: KeyboardEvent) => e.stopPropagation(),
};

export const Gallery = forwardRef<GalleryHandle, ImgProps>(function Gallery(
  { src, alt, footer, className, onClick, animationType },
  ref
) {
  const [dim, setDim] = useState<{ w: number; h: number } | undefined>();
  const [actionContainer, setActionContainer] = useState<HTMLElement | null>(
    null
  );
  const photoswipeRef = useRef<PhotoSwipe>();

  const [id] = useState(uuidv4());

  useImperativeHandle(ref, () => ({
    close: () => {
      photoswipeRef.current?.destroy();
    },
  }));

  return (
    <>
      {actionContainer !== null &&
        footer &&
        createPortal(<Container>{footer}</Container>, actionContainer)}
      <PhotoswipeGallery
        id={id}
        options={{
          showHideAnimationType: animationType ?? "fade",
          zoom: false,
          bgOpacity: 1,
          // Put in ion-app element so share IonActionSheet is on top
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          appendToEl: document.querySelector("ion-app")!,
          paddingFn: () => getSafeArea(),
        }}
        onOpen={(instance) => {
          photoswipeRef.current = instance;
        }}
        uiElements={[
          {
            appendTo: "root",
            onInit: (el) => {
              setActionContainer(el);
            },
          },
        ]}
      >
        <Item
          original={src}
          thumbnail={src}
          width={dim?.w}
          height={dim?.h}
          id={src}
        >
          {({ ref, open }) => (
            <img
              draggable="false"
              ref={ref as React.MutableRefObject<HTMLImageElement>}
              alt={alt}
              onClick={(e) => {
                onClick?.(e);
                open(e);
              }}
              src={src}
              className={className}
              onLoad={(e) => {
                if (!(e.target instanceof HTMLImageElement)) return;

                setDim({ w: e.target.naturalWidth, h: e.target.naturalHeight });
              }}
            />
          )}
        </Item>
      </PhotoswipeGallery>
    </>
  );
});
