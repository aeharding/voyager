import {
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
  IonText,
  IonThumbnail,
} from "@ionic/react";
import { InsetIonItem } from "../shared/formatting";
import styled from "@emotion/styled";
import { useAppDispatch, useAppSelector } from "../../../store";
import { APP_ICONS, AppIcon, updateAppIcon } from "./appIconSlice";

const StyledIonThumbnail = styled(IonThumbnail)`
  margin: 1rem 1rem 1rem 0;

  --size: 5em;
`;

const Img = styled.img`
  border-radius: 1em;
`;

export default function AppIconComponent() {
  const dispatch = useAppDispatch();
  const icon = useAppSelector((state) => state.appIcon.icon);

  function selectIcon(name: AppIcon) {
    dispatch(updateAppIcon(name));
  }

  return (
    <IonRadioGroup value={icon} onIonChange={(e) => selectIcon(e.detail.value)}>
      <IonList inset>
        {APP_ICONS.map((icon) => (
          <InsetIonItem key={icon}>
            <StyledIonThumbnail slot="start" onClick={() => selectIcon(icon)}>
              <Img src={getIconSrc(icon)} />
            </StyledIonThumbnail>
            <IonLabel>
              <h2>{getIconName(icon)}</h2>
              <p>
                <IonText color="medium">{getIconAuthor(icon)}</IonText>
              </p>
            </IonLabel>
            <IonRadio value={icon} />
          </InsetIonItem>
        ))}
      </IonList>
    </IonRadioGroup>
  );
}

export function getIconSrc(icon: AppIcon): string {
  if (icon === "default") return "/logo.png";

  return `/alternateIcons/${icon}.png`;
}

function getIconName(icon: AppIcon): string {
  switch (icon) {
    case "default":
      return "Default";
    case "space":
      return "The Final Frontier";
    case "color":
      return "Planetary";
    case "psych":
      return "Psychedelic!";
    case "original":
      return "O.G.";
  }
}

function getIconAuthor(icon: AppIcon): string | null {
  switch (icon) {
    case "default":
    case "color":
    case "psych":
      return "fer0n";
    case "space":
      return "ripened_avacado";
    case "original":
      return "nathanielcwm";
  }
}
