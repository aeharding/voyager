import React, { forwardRef } from "react";
import {
  isAppleDeviceInstalledToHomescreen,
  isNative,
} from "../../helpers/device";
import { fixSafariAutoscroll } from "../../helpers/safari";
import TextareaAutosize, {
  TextareaAutosizeProps,
} from "react-textarea-autosize";

const TextareaAutosizedForOnScreenKeyboard = forwardRef<
  HTMLTextAreaElement,
  Omit<TextareaAutosizeProps, "onFocus">
>((props, ref) => {
  return (
    <TextareaAutosize
      ref={ref}
      onFocus={(e) => {
        if (!isAppleDeviceInstalledToHomescreen() || isNative()) return;

        // https://stackoverflow.com/a/74902393/1319878
        const target = e.currentTarget;
        target.style.opacity = "0";
        setTimeout(() => (target.style.opacity = "1"));

        fixSafariAutoscroll();
      }}
      {...props}
    />
  );
});

TextareaAutosizedForOnScreenKeyboard.displayName =
  "TextareaAutosizedForOnScreenKeyboard";

export default TextareaAutosizedForOnScreenKeyboard;
