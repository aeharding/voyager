import {
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  useIonAlert,
} from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { ListHeader } from "../shared/formatting";
import { updateFilteredKeywords } from "../settingsSlice";
import { uniq, without } from "lodash";
import { RemoveItemButton } from "../../shared/ListEditor";

export default function FilteredKeywords() {
  const [presentAlert] = useIonAlert();
  const dispatch = useAppDispatch();
  const filteredKeywords = useAppSelector(
    (state) => state.settings.blocks.keywords,
  );

  async function remove(keyword: string) {
    dispatch(updateFilteredKeywords(without(filteredKeywords, keyword)));
  }

  async function add() {
    presentAlert({
      message: "Add Filtered Keyword",
      buttons: [
        {
          text: "OK",
          handler: ({ keyword }) => {
            if (!keyword.trim()) return;

            dispatch(
              updateFilteredKeywords(
                uniq([...filteredKeywords, keyword.trim()]),
              ),
            );
          },
        },
        "Cancel",
      ],
      inputs: [
        {
          placeholder: "Keyword",
          name: "keyword",
        },
      ],
    });
  }

  return (
    <>
      <ListHeader>
        <IonLabel>Filtered Keywords</IonLabel>
      </ListHeader>
      <IonList inset>
        {filteredKeywords.map((keyword) => (
          <IonItemSliding key={keyword}>
            <IonItemOptions side="end" onIonSwipe={() => remove(keyword)}>
              <IonItemOption
                color="danger"
                expandable
                onClick={() => remove(keyword)}
              >
                Unfilter
              </IonItemOption>
            </IonItemOptions>
            <IonItem>
              <RemoveItemButton />
              <IonLabel>{keyword}</IonLabel>
            </IonItem>
          </IonItemSliding>
        ))}

        <IonItemSliding>
          <IonItem onClick={add} button detail={false}>
            <IonLabel color="primary">Add Keyword</IonLabel>
          </IonItem>
        </IonItemSliding>
      </IonList>
    </>
  );
}
