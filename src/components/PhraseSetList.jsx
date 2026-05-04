import React from "react";
import styled from "styled-components";
import supabase from "../supabaseClient";
import Message from "./Message";
import PhraseSetCard from "./PhraseSetCard";
import LinkWrapper from "./LinkWrapper";
import { HashLoader } from "react-spinners";
import usePhraseSets from "../hooks/usePhraseSets";

function PhraseSetList() {
  const { phraseSets, status } = usePhraseSets();
  return (
    <Wrapper>
      {/* <Info>请自由查阅</Info> */}
      {status === "busy" && <HashLoader />}
      {status === "ok" &&
        phraseSets.map((phraseSet) => (
          <CardLink key={phraseSet.id} to={`/phraseSet/${phraseSet.id}`}>
            <PhraseSetCard phraseSet={phraseSet} />
          </CardLink>
        ))}
    </Wrapper>
  );
}
const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;

  position: relative;
`;
const CardLink = styled(LinkWrapper)`
  text-decoration: none;

  &:nth-of-type(2n) > button {
    background-color: var(--gray85);
    color: var(--gray15);
  }

  &:nth-of-type(2n) > button:hover {
    background-color: var(--gray75);
  }

  &:nth-of-type(2n) > button:active {
    background-color: var(--gray60);
  }
`;
const Info = styled.p`
  position: absolute;
  top: -3rem;
`;

export default PhraseSetList;
