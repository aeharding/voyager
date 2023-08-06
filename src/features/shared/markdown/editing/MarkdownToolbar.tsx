import styled from "@emotion/styled";
import bold from "../../../shared/icon/icons/bold.svg";
import italic from "../../../shared/icon/icons/italic.svg";
import { IonIcon } from "@ionic/react";

export const TOOLBAR_TARGET_ID = "toolbar-target";
export const TOOLBAR_HEIGHT = "50px";

import "@github/markdown-toolbar-element";
import { useEffect, useState } from "react";
import { ellipsisHorizontal, image, link } from "ionicons/icons";

const Toolbar = styled.div`
  position: fixed;
  height: ${TOOLBAR_HEIGHT};
  width: 100%;
  background: var(--ion-background-color);
  border-top: 1px solid var(--ion-item-border-color);

  display: flex;
  align-items: center;
  justify-content: space-evenly;
`;

const Button = styled.button`
  padding: 1rem;
  font-size: 1.5rem;

  appearance: none;
  background: none;
  border: 0;
`;

export default function MarkdownToolbar() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const updateViewport = () => {
      // For the rare legacy browsers that don't support it
      if (!window.visualViewport) {
        return;
      }
      setKeyboardHeight(window.innerHeight - window.visualViewport.height);
    };

    const onResize = () => {
      updateViewport();
    };

    updateViewport();

    window.visualViewport?.addEventListener("resize", onResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <markdown-toolbar for={TOOLBAR_TARGET_ID}>
      <Toolbar style={{ bottom: `${keyboardHeight}px` }}>
        <Button>
          <IonIcon icon={image} color="primary" />
        </Button>
        <Button>
          <IonIcon icon={link} color="primary" />
        </Button>
        <md-bold>
          <Button>
            <IonIcon icon={bold} color="primary" />
          </Button>
        </md-bold>
        <md-italic>
          <Button>
            <IonIcon icon={italic} color="primary" />
          </Button>
        </md-italic>
        <Button>
          <IonIcon icon={ellipsisHorizontal} color="primary" />
        </Button>
      </Toolbar>
    </markdown-toolbar>
  );
}
