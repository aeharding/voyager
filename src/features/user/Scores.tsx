import { useIonAlert } from "@ionic/react";
import { PersonAggregates } from "lemmy-js-client";

import Ago, { formatRelativeToNow } from "#/features/labels/Ago";
import { formatNumber } from "#/helpers/number";

import styles from "./Scores.module.css";

interface ScoreProps {
  aggregates: PersonAggregates;
  accountCreated: string;
}

export default function Scores({ aggregates, accountCreated }: ScoreProps) {
  const [present] = useIonAlert();

  const creationDate = new Date(accountCreated);

  const posts = aggregates.post_count;
  const comments = aggregates.comment_count;
  const total = posts + comments;

  const showScoreAlert = async (focus: "post" | "comment") => {
    const postPointsLine = `${posts.toLocaleString()} Posts`;
    const commentPointsLine = `${comments.toLocaleString()} Comments`;

    const totalScoreLine = `${total.toLocaleString()} Total Submissions`;

    const header = focus === "post" ? postPointsLine : commentPointsLine;

    const message = [
      focus === "post" ? commentPointsLine : postPointsLine,
      totalScoreLine,
    ];

    await present({
      header,
      cssClass: "preserve-newlines",
      message: message.join("\n"),
      buttons: [{ text: "OK" }],
    });
  };

  return (
    <>
      <div className={styles.container}>
        <div
          className={styles.score}
          onClick={() => {
            showScoreAlert("comment");
          }}
        >
          {formatNumber(aggregates.comment_count)}
          <aside>Comment count</aside>
        </div>
        <div
          className={styles.score}
          onClick={() => {
            showScoreAlert("post");
          }}
        >
          {formatNumber(aggregates.post_count)}
          <aside>Post count</aside>
        </div>
        <div
          className={styles.score}
          onClick={() => {
            present({
              header: `Account is ${formatRelativeToNow(creationDate, "verbose")} old`,
              message: `Created on ${creationDate.toDateString()} at ${creationDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`,
              buttons: [{ text: "OK" }],
            });
          }}
        >
          <Ago as="short" date={accountCreated} />
          <aside>Account age</aside>
        </div>
      </div>
    </>
  );
}
