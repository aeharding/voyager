import { stopIonicTapClick } from "#/helpers/ionic";

/**
 * This prevents the `ion-activatable` tap highlight
 * when tapping buttons and other things within the activatable ion-item
 **/
function onPreventIonicTapClick(e: MouseEvent | TouchEvent) {
  if (!(e.target instanceof HTMLElement)) return;
  if (!e.target.closest("ion-button,a,img,input,button")) return;

  stopIonicTapClick();
}

document.addEventListener("touchstart", onPreventIonicTapClick);
document.addEventListener("mousedown", onPreventIonicTapClick);
