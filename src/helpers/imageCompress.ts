/**
 * Source: https://stackoverflow.com/a/44849182/1319878
 */

function getExifOrientation(
  file: Blob,
  callback: (orientation: number) => void
) {
  file = file.slice(0, 131072);

  const reader = new FileReader();
  reader.onload = function (e: ProgressEvent<FileReader>) {
    const target = e.target;
    if (!target) throw new Error("no target");

    const view = new DataView(target.result as ArrayBuffer);
    if (view.getUint16(0, false) !== 0xffd8) {
      callback(-2);
      return;
    }
    const length = view.byteLength;
    let offset = 2;
    while (offset < length) {
      const marker = view.getUint16(offset, false);
      offset += 2;
      if (marker === 0xffe1) {
        if (view.getUint32((offset += 2), false) !== 0x45786966) {
          callback(-1);
          return;
        }
        const little = view.getUint16((offset += 6), false) === 0x4949;
        offset += view.getUint32(offset + 4, little);
        const tags = view.getUint16(offset, little);
        offset += 2;
        for (let i = 0; i < tags; i++) {
          if (view.getUint16(offset + i * 12, little) === 0x0112) {
            callback(view.getUint16(offset + i * 12 + 8, little));
            return;
          }
        }
      } else if ((marker & 0xff00) !== 0xff00) {
        break;
      } else {
        offset += view.getUint16(offset, false);
      }
    }
    callback(-1);
  };
  reader.readAsArrayBuffer(file);
}

function imgToCanvasWithOrientation(
  img: HTMLImageElement,
  rawWidth: number,
  rawHeight: number,
  orientation: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  if (orientation > 4) {
    canvas.width = rawHeight;
    canvas.height = rawWidth;
  } else {
    canvas.width = rawWidth;
    canvas.height = rawHeight;
  }

  if (orientation > 1) {
    // eslint-disable-next-line no-console
    console.log("EXIF orientation = " + orientation + ", rotating picture");
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");

  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, rawWidth, 0);
      break;
    case 3:
      ctx.transform(-1, 0, 0, -1, rawWidth, rawHeight);
      break;
    case 4:
      ctx.transform(1, 0, 0, -1, 0, rawHeight);
      break;
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      ctx.transform(0, 1, -1, 0, rawHeight, 0);
      break;
    case 7:
      ctx.transform(0, -1, -1, 0, rawHeight, rawWidth);
      break;
    case 8:
      ctx.transform(0, -1, 1, 0, 0, rawWidth);
      break;
  }
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
      getExifOrientation(file, function (orientation) {
        let w = img.width,
          h = img.height;
        const scale =
          orientation > 4
            ? Math.min(maxHeight / w, maxWidth / h, 1)
            : Math.min(maxWidth / w, maxHeight / h, 1);
        h = Math.round(h * scale);
        w = Math.round(w * scale);

        const canvas = imgToCanvasWithOrientation(img, w, h, orientation);
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
    });

    img.src = URL.createObjectURL(file);
  });
}
