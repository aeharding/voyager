import React from "react";
import { isAppleDeviceInstalledToHomescreen } from "../../helpers/device";
import { fixSafariAutoscroll } from "../../helpers/safari";
import TextareaAutosize, {
  TextareaAutosizeProps,
} from "react-textarea-autosize";

export default function TextareaAutosizedForOnScreenKeyboard(
  props: Omit<
    TextareaAutosizeProps & React.RefAttributes<HTMLTextAreaElement>,
    "onFocus"
  >
) {
  return (
    <TextareaAutosize
      onFocus={(e) => {
        if (!isAppleDeviceInstalledToHomescreen()) return;

        // https://stackoverflow.com/a/74902393/1319878
        const target = e.currentTarget;
        target.style.opacity = "0";
        setTimeout(() => (target.style.opacity = "1"));

        fixSafariAutoscroll();
      }}
      {...props}
    />
  );
}
