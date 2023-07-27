/**
 * Source: https://stackoverflow.com/a/44849182/1319878
 */

function imgToCanvas(
  img: HTMLImageElement,
  rawWidth: number,
  rawHeight: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");

  canvas.width = rawWidth;
  canvas.height = rawHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");

  ctx.drawImage(img, 0, 0, rawWidth, rawHeight);
  return canvas;
}

export async function reduceFileSize(
  file: File,
  acceptFileSize: number,
  maxWidth: number,
  maxHeight: number,
  quality = 0.7
): Promise<Blob | File> {
  return new Promise((resolve) => {
    if (file.size <= acceptFileSize) {
      resolve(file);
      return;
    }
    const img = new Image();

    img.addEventListener("error", function () {
      URL.revokeObjectURL(this.src);
      resolve(file);
    });

    img.addEventListener("load", function () {
      URL.revokeObjectURL(this.src);
      let w = img.width,
        h = img.height;

      const scale = Math.min(maxWidth / w, maxHeight / h, 1);

      w = Math.round(w * scale);
      h = Math.round(h * scale);

      const canvas = imgToCanvas(img, w, h);
      canvas.toBlob(
        function (blob) {
          // eslint-disable-next-line no-console
          console.log(
            "Resized image to " +
              w +
              "x" +
              h +
              ", " +
              (blob ? blob.size >> 10 : "???") +
              "kB"
          );
          if (blob) resolve(blob);
          else resolve(file);
        },
        "image/jpeg",
        quality
      );
    });

    img.src = URL.createObjectURL(file);
  });
}
