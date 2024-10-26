import { IonButton, IonButtons, IonIcon } from "@ionic/react";
import { chevronDown, close } from "ionicons/icons";
import React, { useContext, useEffect, useRef } from "react";
import { TitleSearchContext } from "./TitleSearchProvider";
import { styled } from "@linaria/react";
import { isIosTheme } from "../../../helpers/device";
import { findCurrentPage } from "../../../helpers/ionic";
import AppTitle, { AppTitleHandle } from "../../shared/AppTitle";

const TitleContents = styled.span`
  display: inline-flex;
  align-items: center;

  .ios & {
    justify-content: center;
  }

  gap: 0.25rem;

  width: 100%;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const StyledInput = styled.input`
  max-width: 115px;
  margin: auto;
  background: none;
  border: 0;
  font-weight: normal;
  width: 100%;
  text-align: inherit;
  outline: none;

  && {
    padding-top: 0;
    padding-bottom: 0;
  }

  .searchbar-search-icon {
    display: none;
    width: 0;
    height: 0;
  }

  --background: none;
`;

const DropdownIcon = styled(IonIcon)`
  flex-shrink: 0;
`;

const TITLE_CLASS = "title-search-opener";

export function openTitleSearch() {
  findCurrentPage()
    ?.closest(".ion-page")
    ?.querySelector<HTMLElement>(`.${TITLE_CLASS}`)
    ?.click();
}

interface TitleSearchProps {
  name: string;
  children: React.ReactNode;

  ref?: React.RefObject<AppTitleHandle>;
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
          <StyledInput
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
        <TitleContents ref={titleRef} className={TITLE_CLASS}>
          <span>{name}</span> <DropdownIcon icon={chevronDown} />
        </TitleContents>
      </AppTitle>
      {children}
    </>
  );
}
