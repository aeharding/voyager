import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { BiometricAuth } from "@aparajita/capacitor-biometric-auth";
import { css } from "@emotion/react";
import { IonButton } from "@ionic/react";
import { App } from "@capacitor/app";
import { isAndroid } from "../../../helpers/device";
import { PrivacyScreen } from "@capacitor-community/privacy-screen";
import { useAppDispatch } from "../../../store";
import { retrieveBiometricTypeIfNeeded } from "./biometricSlice";

const LockedBackdrop = styled.div<{ locked: boolean }>`
  position: fixed;
  inset: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  backdrop-filter: blur(32px) brightness(0.6);

  opacity: 0;
  transition: opacity 300ms linear;
  pointer-events: none;

  ${({ locked }) =>
    locked &&
    css`
      opacity: 1;
      transition: none;
      pointer-events: inherit;
    `}
`;

const LOCK_TIME = 5_000;

if (isAndroid()) {
  PrivacyScreen.enable();
}

export default function BiometricAppGuard() {
  const [locked, setLocked] = useState(true);
  const [failed, _setFailed] = useState(false);
  const failedRef = useRef(false);
  const authenticatedRef = useRef(false);
  const wentInactiveTimeRef = useRef(0);
  const dispatch = useAppDispatch();

  function setFailed(failed: boolean) {
    _setFailed(failed);
    failedRef.current = failed;
  }

  useEffect(() => {
    dispatch(retrieveBiometricTypeIfNeeded());

    authenticateIfNeeded();
    setupListeners();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Note: It is important that this function is only called once per app launch
   */
  function setupListeners() {
    App.addListener("appStateChange", (e) => {
      if (e.isActive) {
        if (authenticatedRef.current) {
          authenticatedRef.current = false;
          setLocked(false);

          return;
        }

        authenticateIfNeeded();
      } else {
        setLocked(true);
        wentInactiveTimeRef.current = Date.now();
      }
    });

    App.addListener("pause", () => {
      authenticatedRef.current = false;
    });
  }

  async function authenticateIfNeeded() {
    if (failedRef.current) return;

    if (Date.now() - wentInactiveTimeRef.current < LOCK_TIME) {
      setLocked(false);
      return;
    }

    try {
      await BiometricAuth.authenticate({
        allowDeviceCredential: true,
      });
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "biometryNotEnrolled"
      ) {
        setLocked(false);
        return;
      }

      setFailed(true);
      throw error;
    }

    authenticatedRef.current = true;
  }

  return (
    <LockedBackdrop locked={locked}>
      {failed && (
        <div>
          <IonButton
            onClick={() => {
              setFailed(false);
              authenticateIfNeeded();
            }}
          >
            Unlock Voyager
          </IonButton>
        </div>
      )}
    </LockedBackdrop>
  );
}
