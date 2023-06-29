import styled from "@emotion/styled";
import { PersonAggregates } from "lemmy-js-client";
import { formatNumber } from "../../helpers/number";
import Ago from "../labels/Ago";
import AccountAgeAlert from "./AgeAlert";
import { useState } from "react";

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
  const [accountAgeAlertOpen, setAccountAgeAlertOpen] = useState(false);

  return (
    <>
      <Container>
        <Score>
          {formatNumber(aggregates.comment_score)}
          <aside>Comment score</aside>
        </Score>
        <Score>
          {formatNumber(aggregates.post_score)}
          <aside>Post score</aside>
        </Score>
        <Score
          onClick={() => {
            setAccountAgeAlertOpen(true);
          }}
        >
          <Ago date={accountCreated} />
          <aside>Account age</aside>
        </Score>
      </Container>
      <AccountAgeAlert
        isOpen={accountAgeAlertOpen}
        setIsOpen={setAccountAgeAlertOpen}
        accountCreated={accountCreated}
      />
    </>
  );
}
