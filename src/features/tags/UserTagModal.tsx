import {
  IonButton,
  IonButtons,
  IonInput,
  IonItem,
  IonList,
  IonModal,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { styled } from "@linaria/react";
import { Person } from "lemmy-js-client";
import { useEffect, useState } from "react";

import { Centered } from "#/features/auth/login/LoginNav";
import PersonLink from "#/features/labels/links/PersonLink";
import AppHeader from "#/features/shared/AppHeader";
import { getRemoteHandle } from "#/helpers/lemmy";

import { useAppDispatch, useAppSelector } from "../../store";
import { generateNewTag, updateTag } from "./userTagSlice";

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
    max-width: 42px;
  }

  && input {
    appearance: none;
    border-radius: 4px;
    height: 25px;
    border: 1px solid
      var(
        --ion-item-border-color,
        var(
          --ion-border-color,
          var(
            --ion-color-step-250,
            var(--ion-background-color-step-250, #c8c7cc)
          )
        )
      );
  }

  ::-moz-color-swatch,
  ::-webkit-color-swatch {
    border-style: none;
  }

  ::-webkit-color-swatch-wrapper {
    padding: 0;
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

  const [upvotes, setUpvotes] = useState(`${tag.upvotes}`);
  const [downvotes, setDownvotes] = useState(`${tag.downvotes}`);

  useEffect(() => {
    if (isNaN(+upvotes) || +upvotes < 0) return;

    setTag((tag) => ({
      ...tag,
      upvotes: +upvotes,
    }));
  }, [upvotes]);

  useEffect(() => {
    if (isNaN(+downvotes) || +downvotes < 0) return;

    setTag((tag) => ({
      ...tag,
      downvotes: +downvotes,
    }));
  }, [downvotes]);

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
              // TODO add Ionic support for color input
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              type={"color" as any}
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
              inputMode="numeric"
              value={upvotes}
              onIonInput={(e) => {
                setUpvotes(e.detail.value ?? "");
              }}
              onIonBlur={() => {
                setUpvotes(`${tag.upvotes}`);
              }}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Downvotes"
              type="number"
              inputMode="numeric"
              value={downvotes}
              onIonInput={(e) => {
                setDownvotes(e.detail.value ?? "");
              }}
              onIonBlur={() => {
                setDownvotes(`${tag.downvotes}`);
              }}
            />
          </IonItem>
        </IonList>
      </Contents>
    </>
  );
}
