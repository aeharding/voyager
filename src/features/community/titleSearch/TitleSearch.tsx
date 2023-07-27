import styled from "@emotion/styled";
import { IonButton, IonButtons, IonIcon, IonTitle } from "@ionic/react";
import { chevronDown } from "ionicons/icons";
import React, { useContext, useEffect, useRef } from "react";
import { TitleSearchContext } from "./TitleSearchProvider";

const TitleContents = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

interface TitleSearchProps {
  name: string;
  children: React.ReactNode;
}

export default function TitleSearch({ name, children }: TitleSearchProps) {
  const { setSearch, searching, setSearching, onSubmit } =
    useContext(TitleSearchContext);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searching) return;

    searchRef.current?.focus();
  }, [searching]);

  if (searching) {
    return (
      <>
        <IonTitle>
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
        </IonTitle>

        <IonButtons slot="end">
          <IonButton onClick={() => setSearching(false)}>Cancel</IonButton>
        </IonButtons>
      </>
    );
  }

  return (
    <>
      <IonTitle>
        <TitleContents onClick={() => setSearching(true)}>
          <span>{name}</span> <IonIcon icon={chevronDown} />
        </TitleContents>
      </IonTitle>
      {children}
    </>
  );
}
