import { forwardRef, useEffect, useRef } from "react";
import { mergeRefs } from "react-merge-refs";
import { GalleryMediaProps } from "./GalleryMedia";

export default forwardRef<
  HTMLCanvasElement | HTMLImageElement,
  GalleryMediaProps
>(function GalleryGif({ onClick, ...props }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const syntheticImgRef = useRef<HTMLImageElement>();

  const loaded = useRef(false);

  useEffect(() => {
    syntheticImgRef.current = new Image();

    if (!props.src) return;

    syntheticImgRef.current.src = props.src;

    syntheticImgRef.current.addEventListener("load", function () {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Clear the canvas before drawing the new image
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the new image
      canvas.width = this.width;
      canvas.height = this.height;
      ctx.drawImage(syntheticImgRef.current!, 0, 0);
      loaded.current = true;
    });
  }, [props.src]);

  return (
    <canvas
      className={props.className}
      style={props.style}
      width={0}
      height={0}
      ref={mergeRefs([canvasRef, ref])}
      onClick={(e) => {
        if (!loaded.current) return;

        e.stopPropagation();

        onClick?.(e);
      }}
      role="img"
      aria-label={props.alt}
    />
  );
});
