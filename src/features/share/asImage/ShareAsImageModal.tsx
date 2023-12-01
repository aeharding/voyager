import { CommentView } from "lemmy-js-client";
import ShareAsImage from "./ShareAsImage";
import { MutableRefObject, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { IonButtons, IonHeader, IonIcon, IonTitle } from "@ionic/react";
import {
  CloseButton,
  TransparentIonToolbar,
} from "../../shared/selectorModals/GenericSelectorModal";
import { close } from "ionicons/icons";

export interface ShareAsImageData {
  comment: CommentView;
  comments: CommentView[];
}

interface SelectTextProps {
  dataRef: MutableRefObject<ShareAsImageData>;
  onDismiss: () => void;
}

const Content = styled.div`
  background: var(--ion-color-step-50, #f2f2f7);
`;

export default function ShareAsImageModal({
  dataRef,
  onDismiss,
}: SelectTextProps) {
  const [data, setData] = useState<ShareAsImageData | undefined>(undefined);

  useEffect(() => {
    setData(dataRef.current);
  }, [dataRef]);

  return (
    <Content>
      {data && (
        <ShareAsImage
          data={data}
          header={
            <IonHeader>
              <TransparentIonToolbar>
                <IonButtons slot="end">
                  <CloseButton color="medium" onClick={() => onDismiss()}>
                    <IonIcon icon={close} />
                  </CloseButton>
                </IonButtons>
                <IonTitle>Preview</IonTitle>
              </TransparentIonToolbar>
            </IonHeader>
          }
        />
      )}
    </Content>
  );
}
