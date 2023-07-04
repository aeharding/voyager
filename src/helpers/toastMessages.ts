import { ToastOptions } from "@ionic/core";

export const voteError: ToastOptions = {
  message: "Problem voting. Please try again.",
  duration: 3500,
  position: "bottom",
  color: "danger",
};

export const saveError: ToastOptions = {
  message: "Problem bookmarking. Please try again.",
  duration: 3500,
  position: "bottom",
  color: "danger",
};
