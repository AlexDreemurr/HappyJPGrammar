import styled from "styled-components";
import React from "react";
import SentenceBox from "./SentenceBox";

export default function HistoryQuizes({ historyQuizes }) {
  return (
    <Wrapper>
      {historyQuizes.map((quizObject) => (
        <SentenceBox type="sentence" key={quizObject.id}>
          {quizObject.rawSentence}
        </SentenceBox>
      ))}
    </Wrapper>
  );
}
const Wrapper = styled.div``;
const QuizCard = styled.div``;
