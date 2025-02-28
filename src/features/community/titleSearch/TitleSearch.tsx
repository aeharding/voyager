import { IonButton, IonButtons, IonIcon } from "@ionic/react";
import { chevronDown, close } from "ionicons/icons";
import React, { useContext, useEffect, useRef } from "react";

import AppTitle, { AppTitleHandle } from "#/features/shared/AppTitle";
import { cx } from "#/helpers/css";
import { isIosTheme } from "#/helpers/device";
import { findCurrentPage } from "#/helpers/ionic";

import { TitleSearchContext } from "./TitleSearchProvider";

import styles from "./TitleSearch.module.css";

const TITLE_CLASS = "title-search-opener";

export function openTitleSearch() {
  findCurrentPage()
    ?.closest(".ion-page")
    ?.querySelector<HTMLElement>(`.${TITLE_CLASS}`)
    ?.click();
}

interface TitleSearchProps extends React.PropsWithChildren {
  name: string;

  ref?: React.RefObject<AppTitleHandle | undefined>;
}

export default function TitleSearch({ name, children, ref }: TitleSearchProps) {
  const { setSearch, searching, setSearching, onSubmit } =
    useContext(TitleSearchContext);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searching) return;

    searchRef.current?.focus();
  }, [searching]);

  const titleRef = useRef<HTMLElement>(null);

  // Need to declare manually, otherwise it can't be triggered from TabBar :(
  useEffect(() => {
    const activate = () => setSearching(true);
    const title = titleRef.current;

    title?.addEventListener("click", activate);

    return () => title?.removeEventListener("click", activate);
  }, [searching, setSearching]);

  if (searching) {
    return (
      <>
        <AppTitle appRef={ref}>
          <input
            className={styles.input}
            ref={searchRef}
            placeholder="Community..."
            onChange={(e) => setSearch(e.target.value || "")}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Tab") {
                setSearching(false);
              }

              if (e.key === "Enter") onSubmit();
            }}
            enterKeyHint="go"
          />
        </AppTitle>

        <IonButtons slot="end">
          <IonButton onClick={() => setSearching(false)}>
            {isIosTheme() ? (
              "Cancel"
            ) : (
              <IonIcon icon={close} slot="icon-only" />
            )}
          </IonButton>
        </IonButtons>
      </>
    );
  }

  return (
    <>
      <AppTitle fullPadding={75} appRef={ref}>
        <span ref={titleRef} className={cx(styles.titleContents, TITLE_CLASS)}>
          <span>{name}</span>{" "}
          <IonIcon className={styles.dropdownIcon} icon={chevronDown} />
        </span>
      </AppTitle>
      {children}
    </>
  );
}
