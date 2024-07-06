import { css } from "@linaria/core";

export const baseVariables = css`
  :global() {
    :root {
      --ion-text-color: #000;

      /** primary **/
      --ion-color-primary: #3880ff;
      --ion-color-primary-rgb: 56, 128, 255;
      --ion-color-primary-contrast: #ffffff;
      --ion-color-primary-contrast-rgb: 255, 255, 255;
      --ion-color-primary-shade: #3171e0;
      --ion-color-primary-tint: #4c8dff;

      /** secondary **/
      --ion-color-secondary: #3dc2ff;
      --ion-color-secondary-rgb: 61, 194, 255;
      --ion-color-secondary-contrast: #ffffff;
      --ion-color-secondary-contrast-rgb: 255, 255, 255;
      --ion-color-secondary-shade: #36abe0;
      --ion-color-secondary-tint: #50c8ff;

      /** tertiary **/
      --ion-color-tertiary: #5260ff;
      --ion-color-tertiary-rgb: 82, 96, 255;
      --ion-color-tertiary-contrast: #ffffff;
      --ion-color-tertiary-contrast-rgb: 255, 255, 255;
      --ion-color-tertiary-shade: #4854e0;
      --ion-color-tertiary-tint: #6370ff;

      /** success **/
      --ion-color-success: #07be02;
      --ion-color-success-rgb: 7, 190, 2;
      --ion-color-success-contrast: #ffffff;
      --ion-color-success-contrast-rgb: 255, 255, 255;
      --ion-color-success-shade: #06a702;
      --ion-color-success-tint: #20c51b;

      /** warning **/
      --ion-color-warning: #ffc409;
      --ion-color-warning-rgb: 255, 196, 9;
      --ion-color-warning-contrast: #000000;
      --ion-color-warning-contrast-rgb: 0, 0, 0;
      --ion-color-warning-shade: #e0ac08;
      --ion-color-warning-tint: #ffca22;

      /** danger **/
      --ion-color-danger: #eb445a;
      --ion-color-danger-rgb: 235, 68, 90;
      --ion-color-danger-contrast: #ffffff;
      --ion-color-danger-contrast-rgb: 255, 255, 255;
      --ion-color-danger-shade: #cf3c4f;
      --ion-color-danger-tint: #ed576b;

      /** dark **/
      --ion-color-dark: #222428;
      --ion-color-dark-rgb: 34, 36, 40;
      --ion-color-dark-contrast: #ffffff;
      --ion-color-dark-contrast-rgb: 255, 255, 255;
      --ion-color-dark-shade: #1e2023;
      --ion-color-dark-tint: #383a3e;

      /** medium **/
      --ion-color-medium: #92949c;
      --ion-color-medium-rgb: 146, 148, 156;
      --ion-color-medium-contrast: #ffffff;
      --ion-color-medium-contrast-rgb: 255, 255, 255;
      --ion-color-medium-shade: #808289;
      --ion-color-medium-tint: #9d9fa6;

      /** light **/
      --ion-color-light: #f4f5f8;
      --ion-color-light-rgb: 244, 245, 248;
      --ion-color-light-contrast: #000000;
      --ion-color-light-contrast-rgb: 0, 0, 0;
      --ion-color-light-shade: #d7d8da;
      --ion-color-light-tint: #f5f6f9;

      --ion-color-medium2: var(--ion-color-medium);

      --lightroom-bg: rgba(0, 0, 0, 0.047);

      --thick-separator-color: var(--ion-background-color-step-50, #f2f2f7);

      --ion-background-color-step-100: #f3f3f3;

      --unread-item-background-color: #e3f1ff;

      --ion-color-text-aside: rgba(0, 0, 0, 0.55);

      --read-color: rgba(0, 0, 0, 0.45);
      --read-color-medium: rgba(0, 0, 0, 0.4);

      --share-img-drop-shadow: none;

      --ion-color-reddit-upvote: #ff5c01;

      &.theme-has-custom-background {
        &.ios body,
        &.md body {
          --ion-background-color: var(--app-background) !important;
          --ion-item-background: var(--app-background);
          --ion-background-color-step-50: var(--app-inset-item-background);
          --ion-background-color-step-100: var(--app-tab-bar-background);
          --ion-tab-bar-background: var(--app-tab-bar-background);
          --ion-toolbar-background: var(--app-tab-bar-background);
          --thick-separator-color: var(--app-inset-item-background);
        }

        ion-list.list-inset ion-item {
          --background: var(--app-inset-item-background);
        }

        &.ios ion-modal:not(.small, .transparent-scroll) {
          --ion-background-color: var(--app-background);
          --ion-toolbar-background: var(--app-tab-bar-background);
          --ion-toolbar-border-color: var(--ion-background-color-step-150);

          --ion-item-background: var(--ion-background-color);
        }
      }
    }

    .ios body {
      --ion-background-color: #fff;
    }

    .ios ion-modal {
      --ion-background-color: var(--ion-background-color-step-50, #f2f2f7);
      --ion-item-background: #fff;
    }

    .ion-color-primary-fixed {
      --ion-color-base: var(--ion-color-primary-fixed);
    }
    .ion-color-reddit-upvote {
      --ion-color-base: var(--ion-color-reddit-upvote);
    }
  }
`;

export const lightVariables = css`
  :global() {
    html:not(.ion-palette-dark) {
      &:root {
        --ion-color-primary: var(--app-primary);
        --ion-color-primary-fixed: #3880ff; // always blue always blue!

        ion-item {
          // default ionic light mode opacity is too harsh
          --background-activated-opacity: 0.06;
        }

        &.ios .grey-bg {
          --ion-background-color: var(--ion-background-color-step-50, #f2f2f7);

          ion-header {
            --opacity: 0;
          }
          ion-modal ion-content {
            --background: #fff;
          }
          ion-item {
            --ion-background-color: #fff;
          }
          ion-item-sliding {
            background: #fff;
          }
        }

        &.theme-has-custom-background {
          .grey-bg ion-list.list-inset ion-item {
            --background: var(--app-background);
          }
        }
      }
    }
  }
`;

export const darkVariables = css`
  :global() {
    html.ion-palette-dark {
      // Dark Colors
      &:root {
        --ion-color-primary-fixed: #428cff; // always blue always blue!

        --lightroom-bg: rgba(255, 255, 255, 0.08);

        --ion-item-border-color: #333;
      }

      body {
        --ion-color-primary: var(--app-primary);
        --ion-color-primary-rgb: 66, 140, 255;
        --ion-color-primary-contrast: #ffffff;
        --ion-color-primary-contrast-rgb: 255, 255, 255;
        --ion-color-primary-shade: #3a7be0;
        --ion-color-primary-tint: #5598ff;

        --ion-color-secondary: #50c8ff;
        --ion-color-secondary-rgb: 80, 200, 255;
        --ion-color-secondary-contrast: #ffffff;
        --ion-color-secondary-contrast-rgb: 255, 255, 255;
        --ion-color-secondary-shade: #46b0e0;
        --ion-color-secondary-tint: #62ceff;

        --ion-color-tertiary: #6a64ff;
        --ion-color-tertiary-rgb: 106, 100, 255;
        --ion-color-tertiary-contrast: #ffffff;
        --ion-color-tertiary-contrast-rgb: 255, 255, 255;
        --ion-color-tertiary-shade: #5d58e0;
        --ion-color-tertiary-tint: #7974ff;

        --ion-color-success: #00940c;
        --ion-color-success-rgb: 0, 148, 12;
        --ion-color-success-contrast: #ffffff;
        --ion-color-success-contrast-rgb: 255, 255, 255;
        --ion-color-success-shade: #00820b;
        --ion-color-success-tint: #1a9f24;

        --ion-color-warning: #eac200;
        --ion-color-warning-rgb: 234, 194, 0;
        --ion-color-warning-contrast: #000000;
        --ion-color-warning-contrast-rgb: 0, 0, 0;
        --ion-color-warning-shade: #ceab00;
        --ion-color-warning-tint: #ecc81a;

        --ion-color-danger: #ff4961;
        --ion-color-danger-rgb: 255, 73, 97;
        --ion-color-danger-contrast: #ffffff;
        --ion-color-danger-contrast-rgb: 255, 255, 255;
        --ion-color-danger-shade: #e04055;
        --ion-color-danger-tint: #ff5b71;

        --ion-color-dark: #f4f5f8;
        --ion-color-dark-rgb: 244, 245, 248;
        --ion-color-dark-contrast: #000000;
        --ion-color-dark-contrast-rgb: 0, 0, 0;
        --ion-color-dark-shade: #d7d8da;
        --ion-color-dark-tint: #f5f6f9;

        --ion-color-medium: #989aa2;
        --ion-color-medium-rgb: 152, 154, 162;
        --ion-color-medium-contrast: #000000;
        --ion-color-medium-contrast-rgb: 0, 0, 0;
        --ion-color-medium-shade: #86888f;
        --ion-color-medium-tint: #a2a4ab;

        --ion-color-medium2: rgb(112, 113, 120);

        --thick-separator-color: rgba(255, 255, 255, 0.08);

        --unread-item-background-color: #162f4a;

        --ion-color-text-aside: rgba(255, 255, 255, 0.65);

        --read-color: rgba(255, 255, 255, 0.6);
        --read-color-medium: rgba(255, 255, 255, 0.4);

        --share-img-drop-shadow: drop-shadow(0 0 8px black);

        --ion-color-reddit-upvote: #f26700;
      }

      // iOS Dark Theme

      &.ios body {
        /* --ion-text-color: #ddd;
        --ion-text-color-rgb: 255, 255, 255; */

        --ion-item-background: var(--ion-background-color);

        --ion-card-background: #1c1c1d;

        --ion-toolbar-background: var(--ion-background-color);
      }

      &.ios ion-modal {
        --ion-background-color: var(--ion-background-color-step-100);
        --ion-toolbar-background: var(--ion-background-color-step-150);
        --ion-toolbar-border-color: var(--ion-background-color-step-250);
        --ion-item-background: var(--ion-background-color-step-50);
      }

      // Material Design Dark Theme

      @media (max-width: 767px) {
        &.ios ion-modal:not(.small, .transparent-scroll) {
          --ion-background-color: #000;
          --ion-toolbar-background: var(--ion-background-color);
          --ion-toolbar-border-color: var(--ion-background-color-step-150);
        }
      }

      // TODO test other themes
      ion-modal.transparent-scroll.dark {
        --ion-background-color: black;
      }
    }
  }
`;

export const darkBlackModifierVariables = css`
  :global() {
    html.ion-palette-dark {
      &:not(.theme-pure-black) {
        &.ios {
          body {
            --ion-background-color: #22252f;
            --ion-background-color-rgb: 34, 37, 47;
            --ion-tab-bar-background: rgba(0, 0, 0, 0.2);
            --ion-toolbar-border-color: #444;

            ion-tab-bar {
              --ion-tab-bar-background: var(--ion-background-color);
              --ion-tab-bar-border-color: #444;
            }
          }
        }

        &.md {
          body {
            --ion-background-color: #1e1e1e;
            --ion-background-color-rgb: 18, 18, 18;

            --ion-text-color: #ffffff;
            --ion-text-color-rgb: 255, 255, 255;

            --ion-border-color: #222222;

            --ion-item-background: #1e1e1e;

            --ion-toolbar-background: #1f1f1f;

            --ion-tab-bar-background: #1f1f1f;

            --ion-card-background: #1e1e1e;
          }
        }
      }

      &.theme-pure-black {
        &.ios {
          body {
            --ion-background-color: #000000;
            --ion-background-color-rgb: 0, 0, 0;
          }
        }

        &.md {
          body {
            --ion-background-color: black;
            --ion-background-color-rgb: 18, 18, 18;

            --ion-text-color: #ffffff;
            --ion-text-color-rgb: 255, 255, 255;

            --ion-border-color: #222222;

            --ion-item-background: black;

            --ion-toolbar-background: #1f1f1f;

            --ion-tab-bar-background: #1f1f1f;

            --ion-card-background: black;

            --ion-toolbar-background: #121212;
            --ion-tab-bar-background: #121212;
          }
        }
      }
    }
  }
`;
