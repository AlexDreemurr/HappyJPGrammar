import styled from "styled-components";
import React from "react";
import { RenderGrammarWithSpan } from "./QuizAnswer";
export default function HistoryQuizes({ historyQuizes }) {
  return (
    <Wrapper>
      {historyQuizes.map((quizObject) => (
        <RenderGrammarWithSpan str={quizObject.rawSentence} />
      ))}
    </Wrapper>
  );
}
const Wrapper = styled.div``;
const QuizCard = styled.div``;
