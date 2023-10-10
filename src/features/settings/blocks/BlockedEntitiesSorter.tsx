import { IonLabel, IonSegment, IonSegmentButton } from "@ionic/react";

import { SortOptionType } from "./Types";


type BlockedEntitiesSorterProps = {
    sortOption: SortOptionType;
    setSortOption: (value: SortOptionType) => void;
};

const BlockedEntititiesSorter: React.FC<BlockedEntitiesSorterProps> = ({ sortOption, setSortOption }) => {

    return (
        <IonSegment
            value={sortOption}
            onIonChange={e => {
                setSortOption(e.detail.value as 'default' | 'alphabetical');
                console.log("Sort option changed to:", e.detail.value);
            }}
        >
            <IonSegmentButton value="default">
                <IonLabel>Most Recent</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="alphabetical">
                <IonLabel>Alphabetical</IonLabel>
            </IonSegmentButton>
        </IonSegment>
    )

}

export default BlockedEntititiesSorter