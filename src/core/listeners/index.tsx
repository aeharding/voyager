import { TextRecoveryStartupPrompt } from "#/helpers/useTextRecovery";

import AndroidBackButton from "./AndroidBackButton";
import AppUrlListener from "./AppUrlListener";
import DatabaseErrorListener from "./DatabaseErrorListener";
import HapticsListener from "./HapticsListener";
import "./androidSafeArea";
import "./ionActivatable";
import "./keyboardPageResizer";
import "./network/listener";
import "./statusTap";
import { ResetStatusTap } from "./statusTap";

export default function Listeners() {
  return (
    <>
      <AndroidBackButton />
      <ResetStatusTap />
      <HapticsListener />
      <AppUrlListener />
      <TextRecoveryStartupPrompt />
      <DatabaseErrorListener />
    </>
  );
}
