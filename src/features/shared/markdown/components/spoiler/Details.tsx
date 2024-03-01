import { IonAccordion, IonAccordionGroup, IonItem } from "@ionic/react";
import { styled } from "@linaria/react";
import { ComponentProps, createContext, useMemo, useState } from "react";
import { JsxRuntimeComponents } from "react-markdown/lib";

const StyledIonAccordionGroup = styled(IonAccordionGroup)`
  margin-left: 0 !important;
  margin-right: 0 !important;
`;

const HeaderItem = styled(IonItem)`
  --padding-start: 0;
  --padding-end: 0;
  --inner-padding-end: 0;
  --inner-padding-start: 0;

  font-weight: 600;

  --background: none;
  --background-hover: none;
`;

const HeaderItemText = styled.div`
  padding: 12px 0;
`;

const StyledIonAccordion = styled(IonAccordion)`
  background: none;

  [slot="content"] {
    padding: 12px 0;

    background: transparent;

    ${StyledIonAccordionGroup}:not(:last-child) & {
      margin-bottom: 18px;
    }

    border: 8px solid var(--lightroom-bg);
    border-left: none;
    border-right: none;

    // A lot of sidebars do funky things with horizontal
    // rules. So don't use our separators in sidebars
    .sidebar & {
      border: none;
    }

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
            <HeaderItemText>{label}</HeaderItemText>
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
