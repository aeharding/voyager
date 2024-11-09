import TextareaAutosize, {
  TextareaAutosizeProps,
} from "react-textarea-autosize";

import { isAppleDeviceInstalledToHomescreen, isNative } from "#/helpers/device";
import { fixSafariAutoscroll } from "#/helpers/safari";

interface TextareaAutosizedForOnScreenKeyboardProps
  extends Omit<TextareaAutosizeProps, "onFocus"> {
  ref: React.Ref<HTMLTextAreaElement>;
}

export default function TextareaAutosizedForOnScreenKeyboard(
  props: TextareaAutosizedForOnScreenKeyboardProps,
) {
  return (
    <TextareaAutosize
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
}
