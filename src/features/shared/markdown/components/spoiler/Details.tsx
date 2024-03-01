import { IonAccordion, IonAccordionGroup, IonItem } from "@ionic/react";
import { styled } from "@linaria/react";
import { ComponentProps, createContext, useMemo, useState } from "react";
import { JsxRuntimeComponents } from "react-markdown/lib";

const StyledIonAccordionGroup = styled(IonAccordionGroup)`
  margin-left: 0 !important;
  margin-right: 0 !important;

  // force some extra space if spoiler is the only thing in the users' comment
  &:first-child:last-child {
    margin-top: 8px !important;
  }
`;

const StyledIonAccordion = styled(IonAccordion)`
  background: none;

  [slot="header"] {
    --background: var(--lightroom-bg);
  }

  [slot="content"] {
    background: transparent;
    border: 2px solid var(--lightroom-bg);
    border-top: none;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;

    img {
      max-height: none;
    }

    > p:first-child:last-child > img:first-child:last-child {
      margin: -16px;
      max-width: calc(100% + 32px);
      float: left; // fix display: block margin whitespace
    }
  }

  .ion-accordion-toggle-icon {
    opacity: 0.25;
    font-size: 22px;
  }
`;
export default function Details({
  children,
}: ComponentProps<JsxRuntimeComponents["details"]>) {
  const [label, setLabel] = useState<React.ReactNode | undefined>();

  const value = useMemo(() => ({ setLabel }), []);

  return (
    <SpoilerContext.Provider value={value}>
      <StyledIonAccordionGroup expand="inset">
        <StyledIonAccordion onClick={(e) => e.stopPropagation()}>
          <IonItem slot="header">{label}</IonItem>
          <div slot="content" className="ion-padding collapse-md-margins">
            {children}
          </div>
        </StyledIonAccordion>
      </StyledIonAccordionGroup>
    </SpoilerContext.Provider>
  );
}

interface SpoilerContextValue {
  setLabel: (label: React.ReactNode) => void;
}

export const SpoilerContext = createContext<SpoilerContextValue>({
  setLabel: () => {},
});
