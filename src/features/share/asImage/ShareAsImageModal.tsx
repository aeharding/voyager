import { styled } from "@linaria/react";
import { CommentView, PostView } from "lemmy-js-client";
import ShareAsImage from "./ShareAsImage";
import { MutableRefObject, useEffect, useState } from "react";
import { IonButtons, IonIcon, IonTitle } from "@ionic/react";
import {
  CloseButton,
  TransparentIonToolbar,
} from "../../shared/selectorModals/GenericSelectorModal";
import { close } from "ionicons/icons";
import AppHeader from "../../shared/AppHeader";

export type ShareAsImageData =
  | {
      post: PostView;
    }
  | {
      post: PostView;
      comment: CommentView;
      comments: CommentView[];
    };

interface SelectTextProps {
  dataRef: MutableRefObject<ShareAsImageData | null>;
  onDismiss: () => void;
}

const Content = styled.div`
  background: var(--ion-color-step-50, #f2f2f7);
`;

export default function ShareAsImageModal({
  dataRef,
  onDismiss,
}: SelectTextProps) {
  const [data, setData] = useState<ShareAsImageData | null>(null);

  useEffect(() => {
    setData(dataRef.current);
  }, [dataRef]);

  return (
    <Content>
      {data && (
        <ShareAsImage
          data={data}
          header={
            <AppHeader>
              <TransparentIonToolbar>
                <IonButtons slot="end">
                  <CloseButton color="medium" onClick={() => onDismiss()}>
                    <IonIcon icon={close} />
                  </CloseButton>
                </IonButtons>
                <IonTitle>Preview</IonTitle>
              </TransparentIonToolbar>
            </AppHeader>
          }
        />
      )}
    </Content>
  );
}
