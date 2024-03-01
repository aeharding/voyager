import { IonAccordion, IonAccordionGroup, IonItem } from "@ionic/react";
import { styled } from "@linaria/react";
import { ComponentProps, createContext, useMemo, useState } from "react";
import { JsxRuntimeComponents } from "react-markdown/lib";

const StyledIonAccordionGroup = styled(IonAccordionGroup)`
  margin: 15px 0;
`;

const HeaderItem = styled(IonItem)`
  --padding-start: 0;
  --padding-end: 0;
  --inner-padding-end: 0;
  --inner-padding-start: 0;

  /* font-size: inherit; */
  font-weight: 600;

  --background: none;
  --background-hover: none;
`;

const StyledIonAccordion = styled(IonAccordion)`
  background: none;

  [slot="content"] {
    padding: 15px 0;

    background: transparent;

    img {
      max-height: none;
    }
  }

  .ion-accordion-toggle-icon {
    color: var(--ion-color-medium2);
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
      <StyledIonAccordionGroup>
        <StyledIonAccordion>
          <HeaderItem slot="header" onClick={(e) => e.stopPropagation()}>
            {label}
          </HeaderItem>
          <div slot="content" className="collapse-md-margins">
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
