import {
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonModal,
  IonText,
  IonItem,
  IonInput,
  IonList,
} from "@ionic/react";
import { Centered } from "../auth/login/LoginNav";
import { styled } from "@linaria/react";
import AppHeader from "../shared/AppHeader";
import { Person } from "lemmy-js-client";
import { getRemoteHandle } from "../../helpers/lemmy";
import PersonLink from "../labels/links/PersonLink";
import { useAppDispatch, useAppSelector } from "../../store";
import { generateNewTag, updateTag } from "./userTagSlice";
import { useEffect, useState } from "react";

const TagIonModal = styled(IonModal)`
  --height: auto;
`;

const Header = styled.div`
  font-size: 0.8em;
  margin: 8px 32px -8px 32px;
  color: var(--ion-color-medium);
`;

const PreviewIonItem = styled(IonItem)`
  pointer-events: none;

  font-size: 0.8em;
`;

const UserText = styled(IonText)`
  font-size: 0.7em;
  font-weight: normal;
`;

const ColorIonInput = styled(IonInput)`
  .native-wrapper {
    max-width: 32px;
  }

  input {
    border-radius: 50%;
  }
`;

const Contents = styled.div`
  // can't use ion-content with auto height ion-modal
  margin-bottom: var(--ion-safe-area-bottom);
`;

interface UserTagModalProps {
  person: Person;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function UserTagModal(props: UserTagModalProps) {
  return (
    <TagIonModal
      isOpen={props.isOpen}
      onDidDismiss={() => {
        props.setIsOpen(false);
      }}
      initialBreakpoint={1}
      breakpoints={[0, 1]}
      autoFocus
    >
      <UserTagModalContents {...props} />
    </TagIonModal>
  );
}

function UserTagModalContents({ person, setIsOpen }: UserTagModalProps) {
  const dispatch = useAppDispatch();
  const foundTag = useAppSelector(
    (state) => state.userTag.tagByRemoteHandle[getRemoteHandle(person)],
  );

  const [tag, setTag] = useState(
    typeof foundTag === "object"
      ? foundTag
      : generateNewTag(getRemoteHandle(person)),
  );

  useEffect(() => {
    dispatch(updateTag(tag));
  }, [tag, dispatch]);

  return (
    <>
      <AppHeader>
        <IonToolbar>
          <IonTitle>
            <Centered>
              <div>
                <IonText>User Tag</IonText>
                <div>
                  <UserText color="medium">{getRemoteHandle(person)}</UserText>
                </div>
              </div>
            </Centered>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Dismiss
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <Contents>
        <Header>Preview</Header>
        <IonList inset>
          <PreviewIonItem>
            <PersonLink person={person} />
          </PreviewIonItem>
        </IonList>
        <Header>Private tag data</Header>
        <IonList inset>
          <IonItem>
            <IonInput
              label="Label"
              placeholder="Pro tip: emojis"
              value={tag.text}
              onIonInput={(e) => {
                setTag((tag) => ({
                  ...tag,
                  text: e.detail.value ?? undefined,
                }));
              }}
            />
          </IonItem>
          <IonItem>
            <ColorIonInput
              label="Color"
              type="color"
              value={tag.color}
              onIonInput={(e) => {
                setTag((tag) => ({
                  ...tag,
                  color: e.detail.value ?? undefined,
                }));
              }}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Upvotes"
              type="number"
              value={tag.upvotes}
              onIonInput={(e) => {
                setTag((tag) => ({
                  ...tag,
                  upvotes: e.detail.value ? +e.detail.value : 0,
                }));
              }}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Downvotes"
              type="number"
              value={tag.downvotes}
              onIonInput={(e) => {
                setTag((tag) => ({
                  ...tag,
                  downvotes: e.detail.value ? +e.detail.value : 0,
                }));
              }}
            />
          </IonItem>
        </IonList>
      </Contents>
    </>
  );
}
