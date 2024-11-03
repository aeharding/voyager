import { ColorSpace, contrastAPCA, parse, sRGB } from "colorjs.io/fn";

ColorSpace.register(sRGB);

export function getTextColorFor(bgColor: string): string {
  const parsedBgColor = parse(bgColor);
  const onWhite = Math.abs(contrastAPCA(parsedBgColor, "white"));
  const onBlack = Math.abs(contrastAPCA(parsedBgColor, "black"));
  return onWhite > onBlack ? "white" : "black";
}
