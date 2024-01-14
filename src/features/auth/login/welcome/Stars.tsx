import React, {
  HTMLProps,
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";
import { useInView } from "react-intersection-observer";
import { mergeRefs } from "react-merge-refs";

// Copyright (c) 2024 by Loktar (https://codepen.io/loktar00/pen/DdWxwL)
// Source: https://codepen.io/loktar00/pen/DdWxwL (MIT license)
export default function Stars(props: HTMLProps<HTMLCanvasElement>) {
  const [inViewRef, inView] = useInView({
    threshold: 0.5,
  });

  const canvasRef = useRef<HTMLCanvasElement>();

  const setRefs = useCallback(
    (node: HTMLCanvasElement) => {
      // Ref's from useRef needs to have the node assigned to `current`
      canvasRef.current = node;
      // Callback refs, like the one from `useInView`, is a function that takes the node as an argument
      inViewRef(node);
    },
    [inViewRef],
  );

  if (!inView) return <div ref={inViewRef} />;

  return <StarsAnimation {...props} ref={setRefs} />;
}

const StarsAnimation = forwardRef<
  HTMLCanvasElement,
  HTMLProps<HTMLCanvasElement>
>(function StarsAnimation(props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setRefs = mergeRefs([ref, canvasRef]);

  useLayoutEffect(() => {
    // TODO remove timeout
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d")!;

      // Second canvas used for the stars

      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      class Star {
        size: number;
        speed: number;
        x: number;
        y: number;

        constructor(options: { x: number; y: number }) {
          this.size = Math.random() * 2;
          this.speed = Math.random() * 0.05;
          this.x = options.x;
          this.y = options.y;
        }

        reset() {
          this.size = Math.random() * 2;
          this.speed = Math.random() * 0.05;
          this.x = canvas?.width || 0;
          this.y = Math.random() * (canvas?.height || 0);
        }

        update() {
          this.x -= this.speed;
          if (this.x < 0) {
            this.reset();
          } else {
            ctx.fillRect(this.x, this.y, this.size, this.size);
          }
        }
      }

      const entities: Star[] = [];

      // init the stars
      for (let i = 0; i < canvas.height; i++) {
        entities.push(
          new Star({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
          }),
        );
      }

      // animate background
      function animate() {
        ctx.fillStyle = "#110E19";
        ctx.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#ffffff";

        let entLen = entities.length;

        while (entLen--) {
          entities[entLen]?.update();
        }
        requestAnimationFrame(animate);
      }

      animate();
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  return <canvas ref={setRefs} {...props} />;
});
