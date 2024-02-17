import { IonItem, IonList } from "@ionic/react";
import { memo, useMemo } from "react";

interface MigrateSubsListProps {
  link: string;
}

function MigrateSubsList({ link }: MigrateSubsListProps) {
  const subs = useMemo(() => {
    try {
      return parseSubsFromLink(decodeURIComponent(link));
    } catch (error) {
      console.error("Failed to parse link", error);
      return [];
    }
  }, [link]);

  return (
    <IonList>
      {subs?.map((sub) => (
        <IonItem
          key={sub}
          routerLink={`/settings/reddit-migrate/${link}/${sub}`}
        >
          r/{sub}
        </IonItem>
      ))}
    </IonList>
  );
}

export default memo(MigrateSubsList);

export function parseSubsFromLink(multiredditUrl: string) {
  const { pathname } = new URL(multiredditUrl);

  if (!pathname.startsWith("/r/")) return [];

  return pathname.slice(3).split("+");
}
