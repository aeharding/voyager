import { IonItem, IonList } from "@ionic/react";

interface MigrateSubsListProps {
  link: string;
}

export default function MigrateSubsList({ link }: MigrateSubsListProps) {
  const subs = (() => {
    try {
      return parseSubsFromLink(decodeURIComponent(link));
    } catch (error) {
      console.error("Failed to parse link", error);
      return [];
    }
  })();

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

export function parseSubsFromLink(multiredditUrl: string) {
  const { pathname } = new URL(multiredditUrl);

  if (!pathname.startsWith("/r/")) return [];

  return pathname.slice(3).split("+");
}
