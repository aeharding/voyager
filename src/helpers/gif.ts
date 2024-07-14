// https://gist.github.com/zakirt/faa4a58cec5a7505b10e3686a226f285
export function determineIsAnimatedGif(file: File): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const HEADER_LEN = 6;
    const LOGICAL_SCREEN_DESC_LEN = 7;
    const fileReader = new FileReader();

    fileReader.onload = function () {
      const buffer = fileReader.result as ArrayBuffer;
      const dv = new DataView(buffer, HEADER_LEN + LOGICAL_SCREEN_DESC_LEN - 3);
      let offset = 0;
      const globalColorTable = dv.getUint8(0);
      let globalColorTableSize = 0;

      if (globalColorTable & 0x80) {
        globalColorTableSize = 3 * Math.pow(2, (globalColorTable & 0x7) + 1);
      }

      offset = 3 + globalColorTableSize;
      const extensionIntroducer = dv.getUint8(offset);
      const graphicsControlLabel = dv.getUint8(offset + 1);
      let delayTime = 0;

      if (extensionIntroducer & 0x21 && graphicsControlLabel & 0xf9) {
        delayTime = dv.getUint16(offset + 4);
      }

      resolve(delayTime !== 0);
    };

    fileReader.onerror = function (error) {
      reject(error);
    };

    fileReader.readAsArrayBuffer(file);
  });
}
