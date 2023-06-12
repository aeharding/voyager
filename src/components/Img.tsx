/** @jsx jsx */

import styled from "@emotion/styled";
import { useState } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";

import "photoswipe/dist/photoswipe.css";

interface ImgProps {
  src: string;
  alt?: string;
  className?: string;
}

export default function Img({ src, alt, className }: ImgProps) {
  const [dim, setDim] = useState<{ w: number; h: number } | undefined>();

  return (
    <Gallery options={{ showHideAnimationType: "fade" }}>
      <Item original={src} width={dim?.w} height={dim?.h}>
        {({ ref, open }) => (
          <img
            ref={ref as React.MutableRefObject<HTMLImageElement>}
            alt={alt}
            onClick={open}
            src={src}
            className={className}
            onLoad={(e) => {
              if (!(e.target instanceof HTMLImageElement)) return;

              setDim({ w: e.target.naturalWidth, h: e.target.naturalHeight });
            }}
          />
        )}
      </Item>
    </Gallery>
  );
}
