import { IonAccordion, IonAccordionGroup, IonItem } from "@ionic/react";
import { styled } from "@linaria/react";
import {
  ComponentProps,
  createContext,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ExtraProps } from "react-markdown";
import store, { useAppDispatch } from "../../../../../store";
import { getSpoilerId, updateSpoilerState } from "./spoilerSlice";

const StyledIonAccordionGroup = styled(IonAccordionGroup)`
  margin: 1em -12px;
`;

const HeaderItem = styled(IonItem)`
  --padding-start: 12px;
  --padding-end: 12px;
  --inner-padding-end: 0;
  --inner-padding-start: 0;

  font-size: inherit;
  font-weight: 600;

  --background: none;
  --background-hover: none;

  strong {
    // Differentiate from already bold title in header
    font-weight: 900;
  }
`;

const StyledIonAccordion = styled(IonAccordion)`
  background: none;

  [slot="content"] {
    padding: 1em 12px;

    background: transparent;

    img {
      max-height: none;
    }
  }

  .ion-accordion-toggle-icon {
    color: var(--ion-color-medium2);
    font-size: 1.45em;
  }
`;

type DetailsProps = JSX.IntrinsicElements["details"] &
  ExtraProps & {
    id: string;
  };

export default function Details({ children, node, id }: DetailsProps) {
  const accordionGroupRef = useRef<HTMLIonAccordionGroupElement>(null);
  const [label, setLabel] = useState<React.ReactNode | undefined>();
  const dispatch = useAppDispatch();

  const value = useMemo(() => ({ setLabel }), []);

  useLayoutEffect(() => {
    const accordionGroup = accordionGroupRef.current;
    if (!accordionGroup) return;

    const isOpen = store.getState().spoiler.byId[getSpoilerId(id, node)];

    accordionGroup.value = isOpen ? "open" : undefined;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = useCallback<
    NonNullable<ComponentProps<typeof IonAccordionGroup>["onIonChange"]>
  >(
    (e) => {
      dispatch(
        updateSpoilerState({
          id: getSpoilerId(id, node),
          isOpen: e.detail.value === "open",
        }),
      );
    },
    [dispatch, node, id],
  );

  return (
    <SpoilerContext.Provider value={value}>
      <StyledIonAccordionGroup ref={accordionGroupRef} onIonChange={onChange}>
        <StyledIonAccordion value="open">
          <HeaderItem slot="header" onClick={(e) => e.stopPropagation()}>
            <div>{label}</div>
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
