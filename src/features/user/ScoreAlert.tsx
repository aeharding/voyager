import { IonAlert } from "@ionic/react";
import { Dispatch, SetStateAction } from "react";

interface ScoreAlertProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  postScore: number;
  commentScore: number;
  focus: "post" | "comment";
}

export default function ScoreAlert(props: ScoreAlertProps) {
  return (
    <IonAlert
      isOpen={props.isOpen}
      onDidDismiss={() => props.setIsOpen(false)}
      header={`${
        props.focus === "post" ? props.postScore : props.commentScore
      } ${props.focus} points`}
      buttons={[{ text: "OK", handler: () => props.setIsOpen(false) }]}
      style={{
        "white-space": "pre-line",
      }}
      message={`
        ${props.focus === "post" ? props.commentScore : props.postScore} ${
        props.focus === "post" ? "Comment" : "Post"
      } Points\n  
        ${props.postScore + props.commentScore} Total Points`}
    />
  );
}
