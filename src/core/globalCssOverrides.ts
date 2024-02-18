import { css } from "@linaria/core";

export default css`
  :global() {
    :root {
      --sat: env(safe-area-inset-top);
      --sar: env(safe-area-inset-right);
      --sab: env(safe-area-inset-bottom);
      --sal: env(safe-area-inset-left);
    }

    html {
      -webkit-text-size-adjust: 100%; /* Prevent font scaling in landscape while allowing user zoom */
    }

    .ReactCollapse--collapse {
      transition: height 200ms;
    }

    ion-tab-button {
      opacity: 1 !important;
    }

    /*
     * Header doesn't support dynamic font size
     */
    ion-router-outlet > .ion-page > ion-header ion-button,
    ion-router-outlet > .ion-page > ion-header ion-back-button,
    ion-router-outlet > .ion-page > ion-header ion-title {
      font-size: 17px;
    }

    .left-align-buttons
      .action-sheet-button:not(.action-sheet-cancel)
      .action-sheet-button-inner.sc-ion-action-sheet-ios:not(
        .action-sheet-group-cancel
      ) {
      justify-content: flex-start;
    }

    .mod .action-sheet-button:not(.action-sheet-destructive),
    .mod .action-sheet-button:hover:not(.action-sheet-destructive),
    .mod.action-sheet-button:not(.action-sheet-destructive),
    .mod.action-sheet-button:hover:not(.action-sheet-destructive) {
      color: var(--ion-color-success-shade);
    }

    .mod.alert-button {
      color: var(--ion-color-success-shade);
    }

    .admin-local .action-sheet-button,
    .admin-local .action-sheet-button:hover,
    .admin-local.action-sheet-button,
    .admin-local.action-sheet-button:hover,
    .admin-remote .action-sheet-button,
    .admin-remote .action-sheet-button:hover,
    .admin-remote.action-sheet-button,
    .admin-remote.action-sheet-button:hover {
      color: var(--ion-color-danger-shade);
    }

    .report-reasons .action-sheet-title {
      white-space: pre;
    }

    /* https://github.com/ionic-team/ionic-framework/issues/27777#issuecomment-1631522283 */
    .action-sheet-height-fix {
      --height: 100%;
    }

    ion-modal.small {
      --height: 50%;
      --width: 85%;
      --max-width: 400px;
      --max-height: 500px;
      --border-radius: 16px;
      --box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1),
        0 4px 6px -4px rgb(0 0 0 / 0.1);
    }
    ion-modal.small ion-header ion-toolbar:first-of-type {
      padding-top: 0px;
    }

    ion-modal.transparent-scroll {
      --background: none;
      --height: auto;
      --box-shadow: none;

      display: flex;
      flex-direction: column;
    }

    ion-modal.transparent-scroll .ion-page {
      overflow: auto;
      max-height: 100vh;
    }

    ion-alert.preserve-newlines {
      white-space: pre-line;
    }

    .pswp__img {
      -webkit-touch-callout: default;
    }

    ion-action-sheet .detail::before {
      content: "";
      z-index: 1;
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);

      /* Ion chevron right icon */
      background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="none" stroke="%2392949c44" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M184 112l144 144-144 144"/></svg>');
      width: 24px;
      height: 24px;
    }

    ion-action-sheet .action-sheet-selected {
      font-weight: normal !important;
    }

    ion-action-sheet .action-sheet-selected.action-sheet-selected:after {
      background: none;
    }

    /* Double class to override ionic specificity */
    ion-action-sheet .action-sheet-selected .action-sheet-button-inner::after {
      content: "";
      z-index: 1;
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);

      /* Ion check icon */
      background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="none" stroke="%233880ff" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M416 128L192 384l-96-96"/></svg>');

      width: 24px;
      height: 24px;
    }

    ion-action-sheet
      .action-sheet-selected.detail
      .action-sheet-button-inner::after {
      right: 40px;
    }

    ion-action-sheet ion-icon {
      flex-shrink: 0;
      margin-inline-end: 16px !important;
    }

    .ios .action-sheet-button:not(.action-sheet-cancel) {
      padding-inline-end: 0 !important;
      padding-inline-start: 0;
    }

    .ios .left-align-buttons .action-sheet-button:not(.action-sheet-cancel) {
      padding-inline-start: 14px;
    }

    .action-sheet-button-inner {
      mask-image: linear-gradient(
        90deg,
        rgba(0, 0, 0, 1) 0%,
        rgba(0, 0, 0, 1) calc(100% - 16px),
        transparent 100%
      );
    }

    /* photoswipe */

    .pswp__top-bar {
      top: env(safe-area-inset-top, 0);
    }

    /* Let IonActionSheet be on top */
    .pswp {
      --pswp-root-z-index: 100;
    }

    .ion-content-scroll-host {
      overflow-y: auto;
    }

    .virtual-scroller {
      overflow-x: hidden !important;
    }

    .ion-content-scroll-host::before,
    .ion-content-scroll-host::after {
      position: absolute;
      width: 1px;
      height: 1px;
      content: "";
    }

    .ion-content-scroll-host::before {
      top: -1px;
    }

    .ion-content-scroll-host::after {
      bottom: -1px;
    }

    ion-fab-button {
      --background-focused: var(--ion-color-primary);
      --background-activated: var(--ion-color-primary);
      --background-hover: var(--ion-color-primary);
    }

    ion-fab.fab-vertical-top {
      top: 15vh;
    }

    /**
     * This patch reverts the following Ionic change:
     * https://github.com/ionic-team/ionic-framework/pull/28246/files#diff-8371750710eecf6a609337a240b7db295073f746f1cda13248f9780cc6f6ff24L159
     *
     * Private discord discussion: https://discord.com/channels/520266681499779082/1128001453676568637/1162812415054983198
     *
     * Fixes #780
     */
    .ion-page {
      overflow: hidden;
    }

    ion-toast {
      font-weight: 600;
      --height: 45px;
    }

    /* Center toast message and icon */
    ion-toast.center::part(container) {
      display: inline-flex;
      transform: translateX(-50%);
      left: 50%;
      position: relative;
    }

    /* Make header buttons closer together (room for mod button) */
    .sc-ion-buttons-ios-s ion-button {
      margin: 0;
    }

    /* Add minimum padding for top dismiss area of action sheet */
    .action-sheet-group.sc-ion-action-sheet-ios:first-child {
      margin-top: min(15vh, 70px);
    }

    #share-as-image-root {
      font-size: 16px;

      --width: 330px;
      color: var(--ion-text-color);

      position: absolute;
      width: var(--width);
      right: calc(var(--width) * -1);

      a {
        /* Hack for long links breaking */
        word-break: break-word;
      }
    }

    #share-as-image-root ion-item {
      font-size: 16px;
    }

    #share-as-image-root button {
      display: none;
    }

    ion-modal.save-as-image-modal {
      --height: auto;
      --max-width: 470px;
    }

    #share-as-image-root video {
      display: none;
    }

    .collapse-md-margins {
      > *:first-child {
        &,
        > p:first-child {
          margin-top: 0;
        }
      }
      > *:last-child {
        &,
        > p:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
`;
