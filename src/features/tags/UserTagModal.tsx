import {
  IonButton,
  IonButtons,
  IonInput,
  IonItem,
  IonList,
  IonModal,
  IonToolbar,
} from "@ionic/react";
import { Person } from "lemmy-js-client";
import { useEffect, useRef, useState } from "react";

import PersonLink from "#/features/labels/links/PersonLink";
import AppHeader from "#/features/shared/AppHeader";
import MultilineTitle from "#/features/shared/MultilineTitle";
import { cx } from "#/helpers/css";
import { blurOnEnter } from "#/helpers/dom";
import { getRemoteHandle } from "#/helpers/lemmy";
import useKeyboardOpen from "#/helpers/useKeyboardOpen";

import { useAppDispatch, useAppSelector } from "../../store";
import SourceUrlButton from "./SourceUrlButton";
import { generateNewTag, updateTag } from "./userTagSlice";

import styles from "./UserTagModal.module.css";

interface UserTagModalProps {
  person: Person;
  sourceUrl: string | undefined;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function UserTagModal(props: UserTagModalProps) {
  return (
    <IonModal
      className={styles.tagModal}
      isOpen={props.isOpen}
      onDidDismiss={() => {
        props.setIsOpen(false);
      }}
      initialBreakpoint={1}
      breakpoints={[0, 1]}
      autoFocus
    >
      <UserTagModalContents {...props} />
    </IonModal>
  );
}

function UserTagModalContents({
  person,
  sourceUrl,
  setIsOpen,
}: UserTagModalProps) {
  const keyboardOpen = useKeyboardOpen();

  const trackVotesEnabled = useAppSelector(
    (state) => state.settings.tags.trackVotes,
  );
  const saveSource = useAppSelector((state) => state.settings.tags.saveSource);

  const [tag, setTag] = useStoredTag(person);
  const [upvotes, setUpvotes] = useState(`${tag.upvotes}`);
  const [downvotes, setDownvotes] = useState(`${tag.downvotes}`);

  return (
    <>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <SourceUrlButton
              sourceUrl={tag.sourceUrl}
              dismiss={() => setIsOpen(false)}
            />
          </IonButtons>

          <MultilineTitle subheader={getRemoteHandle(person)}>
            User Tag
          </MultilineTitle>

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
      <div className={cx(styles.contents, keyboardOpen && styles.keyboardOpen)}>
        <div className={styles.header}>Preview</div>
        <IonList inset>
          <IonItem className={styles.previewItem}>
            <PersonLink person={person} />
          </IonItem>
        </IonList>
        <div className={styles.header}>Private tag data</div>
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

                  return newTag;
                });
              }}
            />
          </IonItem>
          <IonItem>
            <IonInput
              className={styles.colorInput}
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
      </div>
    </>
  );
}

function useStoredTag(person: Person) {
  const dispatch = useAppDispatch();
  const foundTag = useAppSelector(
    (state) => state.userTag.tagByRemoteHandle[getRemoteHandle(person)],
  );

  function getCurrentValidatedTag() {
    return typeof foundTag === "object"
      ? foundTag
      : generateNewTag(getRemoteHandle(person));
  }

  const tagChangedRef = useRef(false);
  const [tag, _setTag] = useState(getCurrentValidatedTag);
  function setTag(...parameters: Parameters<typeof _setTag>) {
    _setTag(...parameters);
    tagChangedRef.current = true;
  }

  useEffect(() => {
    if (!tagChangedRef.current) return;

    dispatch(updateTag(tag));
  }, [dispatch, tag]);

  return [tag, setTag] as const;
}
