import styled from "@emotion/styled";
import { PersonAggregates } from "lemmy-js-client";
import { formatNumber } from "../../helpers/number";
import Ago from "../labels/Ago";
import { useIonAlert } from "@ionic/react";
import { formatDistanceToNowStrict } from "date-fns";

const Container = styled.div`
  display: flex;
  justify-content: space-evenly;
  gap: 3rem;
  margin: 1.5rem 3rem;
`;

const Score = styled.div`
  text-align: center;
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;

  aside {
    margin-top: 0.35rem;
    opacity: 0.5;
    font-size: 0.8rem;
    font-weight: 500;
  }
`;

interface ScoreProps {
  aggregates: PersonAggregates;
  accountCreated: string;
}

export default function Scores({ aggregates, accountCreated }: ScoreProps) {
  const [present] = useIonAlert();

  const relativeDate = formatDistanceToNowStrict(
    new Date(`${accountCreated}Z`),
    {
      addSuffix: false,
    }
  );
  const creationDate = new Date(accountCreated);

  const postScore = aggregates.post_score;
  const commentScore = aggregates.comment_score;

  const showScoreAlert = async (focus: "post" | "comment") => {
    const subHeader = `${focus === "post" ? commentScore : postScore} ${
      focus === "post" ? "Comment" : "Post"
    } Points`;
    const message = `${postScore + commentScore} Total Points`;

    await present({
      header: `${focus === "post" ? postScore : commentScore} ${focus} points`,
      htmlAttributes: { style: "white-space: pre-line;" },
      subHeader,
      message,
      buttons: [{ text: "OK" }],
    });
  };

  return (
    <>
      <Container>
        <Score
          onClick={() => {
            showScoreAlert("comment");
          }}
        >
          {formatNumber(aggregates.comment_score)}
          <aside>Comment score</aside>
        </Score>
        <Score
          onClick={() => {
            showScoreAlert("post");
          }}
        >
          {formatNumber(aggregates.post_score)}
          <aside>Post score</aside>
        </Score>
        <Score
          onClick={() => {
            present({
              header: `Account is ${relativeDate} old`,
              message: `Created on ${creationDate.toDateString()} at ${creationDate.toLocaleTimeString()}`,
              buttons: [{ text: "OK" }],
            });
          }}
        >
          <Ago date={accountCreated} />
          <aside>Account age</aside>
        </Score>
      </Container>
    </>
  );
}
