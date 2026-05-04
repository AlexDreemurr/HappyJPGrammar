import React from "react";
import { formatToChinaTime } from "../utility";
import styled from "styled-components";
import UnstyledButton from "./UnstyledButton";

function PhraseSetCard({ phraseSet, ...delegated }) {
  return (
    <Wrapper {...delegated}>
      <InfoWrapper>
        <Info>{formatToChinaTime(phraseSet.created_at)}</Info>
        <Info>{phraseSet.count}</Info>
      </InfoWrapper>

      {phraseSet.name}
    </Wrapper>
  );
}
const Wrapper = styled(UnstyledButton)`
  width: 200px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: 1rem;
  background-color: var(--gray15);
  color: var(--gray85);
  &:hover {
    background-color: var(--gray25);
  }
  &:active {
    background-color: var(--gray40);
  }

  &:nth-of-type(2n) {
    background-color: var(--gray85);
    color: var(--gray15);
    &:hover {
      background-color: var(--gray75);
    }
    &:active {
      background-color: var(--gray60);
    }
  }
`;
const InfoWrapper = styled.div`
  width: 100%;
  position: absolute;
  padding: 0.4rem 0.6rem;
  top: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
`;
const Info = styled.p`
  font-size: 0.8rem;
`;
export default PhraseSetCard;
