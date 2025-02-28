import { useMergedRef } from "@mantine/hooks";
import { useEffect, useRef } from "react";

import { GalleryMediaProps } from "./GalleryMedia";

interface GalleryGifProps extends GalleryMediaProps {
  ref?: React.Ref<HTMLCanvasElement>;
}

export default function GalleryGif({
  onClick,
  ref,
  ...props
}: GalleryGifProps) {
  const canvasRef = useRef<HTMLCanvasElement>(undefined);
  const syntheticImgRef = useRef<HTMLImageElement>(undefined);

  const loaded = useRef(false);

  useEffect(() => {
    if (!props.src) return;

    const syntheticImg = new Image();
    syntheticImgRef.current = syntheticImg;
    syntheticImg.src = props.src;

    syntheticImg.addEventListener("load", function () {
      const canvas = canvasRef.current;
      if (!canvas) return;

      loaded.current = true;

      // Clear the canvas before drawing the new image
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the new image
      canvas.width = syntheticImg.width;
      canvas.height = syntheticImg.height;
      ctx.drawImage(syntheticImg, 0, 0);
    });
  }, [props.src]);

  return (
    <canvas
      className={props.className}
      style={props.style}
      width={0}
      height={0}
      ref={useMergedRef(canvasRef, ref)}
      onClick={(e) => {
        if (!loaded.current) return;

        e.stopPropagation();

        onClick?.(e);
      }}
      role="img"
      aria-label={props.alt}
    />
  );
}
