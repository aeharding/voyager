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
import { useState } from "react";

import PersonLink from "#/features/labels/links/PersonLink";
import AppHeader from "#/features/shared/AppHeader";
import { blurOnEnter } from "#/helpers/dom";
import { getRemoteHandle } from "#/helpers/lemmy";

import { useAppDispatch, useAppSelector } from "../../store";
import SourceUrlButton from "./SourceUrlButton";
import { generateNewTag, updateTag } from "./userTagSlice";

import shared from "#/features/shared/shared.module.css";

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
  .native-input {
    max-width: 42px;
  }

  .input-clear-icon {
    margin: 0 0 0 auto;
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
  sourceUrl: string | undefined;
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

function UserTagModalContents({
  person,
  sourceUrl,
  setIsOpen,
}: UserTagModalProps) {
  const dispatch = useAppDispatch();
  const foundTag = useAppSelector(
    (state) => state.userTag.tagByRemoteHandle[getRemoteHandle(person)],
  );
  const trackVotesEnabled = useAppSelector(
    (state) => state.settings.tags.trackVotes,
  );
  const saveSource = useAppSelector((state) => state.settings.tags.saveSource);

  function getCurrentValidatedTag() {
    return typeof foundTag === "object"
      ? foundTag
      : generateNewTag(getRemoteHandle(person));
  }

  const [tag, setTag] = useState(getCurrentValidatedTag);

  const [upvotes, setUpvotes] = useState(`${tag.upvotes}`);
  const [downvotes, setDownvotes] = useState(`${tag.downvotes}`);

  return (
    <>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <SourceUrlButton
              sourceUrl={getCurrentValidatedTag()?.sourceUrl}
              dismiss={() => setIsOpen(false)}
            />
          </IonButtons>
          <IonTitle>
            <div className={shared.multilineTitle}>
              <div>
                <IonText>User Tag</IonText>
                <div>
                  <UserText color="medium">{getRemoteHandle(person)}</UserText>
                </div>
              </div>
            </div>
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
              clearInput
              placeholder="Private user note"
              value={tag.text}
              inputMode="text"
              autocapitalize="on"
              autocorrect="on"
              spellCheck
              enterKeyHint="done"
              onKeyDown={blurOnEnter}
              onIonInput={(e) => {
                setTag((tag) => {
                  const newTag = { ...tag, text: e.detail.value ?? "" };

                  // if new tag text is set, update sourceUrl
                  if (!tag.text && newTag.text && sourceUrl && saveSource)
                    newTag.sourceUrl = sourceUrl;

                  dispatch(updateTag(newTag));
                  return newTag;
                });
              }}
            />
          </IonItem>
          <IonItem>
            <ColorIonInput
              label="Color"
              // @ts-expect-error -- add Ionic support for color input
              type="color"
              clearInput
              value={tag.color}
              onIonInput={(e) => {
                setTag((tag) => {
                  const newTag = {
                    ...tag,
                    color: e.detail.value ?? undefined,
                  };
                  dispatch(updateTag(newTag));
                  return newTag;
                });
              }}
            />
          </IonItem>
          {trackVotesEnabled && (
            <>
              <IonItem>
                <IonInput
                  label="Upvotes"
                  inputMode="numeric"
                  value={upvotes}
                  onIonInput={(e) => {
                    const upvotes = e.detail.value ?? "";

                    setUpvotes(upvotes);
                    setTag((tag) => {
                      if (isNaN(+upvotes) || +upvotes < 0) return tag;

                      const newTag = {
                        ...tag,
                        upvotes: +upvotes,
                      };
                      queueMicrotask(() => dispatch(updateTag(newTag)));
                      return newTag;
                    });
                  }}
                  onIonBlur={() => {
                    setUpvotes(tag.upvotes.toString());
                  }}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  label="Downvotes"
                  inputMode="numeric"
                  value={downvotes}
                  onIonInput={(e) => {
                    const downvotes = e.detail.value ?? "";

                    setDownvotes(downvotes);
                    setTag((tag) => {
                      if (isNaN(+downvotes) || +downvotes < 0) return tag;

                      const newTag = {
                        ...tag,
                        downvotes: +downvotes,
                      };
                      queueMicrotask(() => dispatch(updateTag(newTag)));
                      return newTag;
                    });
                  }}
                  onIonBlur={() => {
                    setDownvotes(tag.downvotes.toString());
                  }}
                />
              </IonItem>
            </>
          )}
        </IonList>
      </Contents>
    </>
  );
}
