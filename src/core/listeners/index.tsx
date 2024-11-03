import "./androidSafeArea";
import "./keyboardPageResizer";
import "./statusTap";
import "./network/listener";
import "./ionActivatable";

import HapticsListener from "./HapticsListener";
import AppUrlListener from "./AppUrlListener";
import { TextRecoveryStartupPrompt } from "../../helpers/useTextRecovery";
import DatabaseErrorListener from "./DatabaseErrorListener";
import { ResetStatusTap } from "./statusTap";
import AndroidBackButton from "./AndroidBackButton";

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
