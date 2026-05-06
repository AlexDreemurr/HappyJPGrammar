import React from "react";
import styled from "styled-components";
import { QUERIES } from "../constants";
import Message from "./Message";
import PhraseSetCard from "./PhraseSetCard";

function PhraseSetList({
  phraseSets,
  selectionMode = false,
  selectedPhraseSetIds = [],
  onSelectionChange,
}) {
  return (
    <Wrapper>
      {phraseSets.length === 0 && <Message>还没有词汇集。</Message>}
      {phraseSets.map((phraseSet) => {
        const isSelected = selectedPhraseSetIds.includes(phraseSet.id);
        const card = (
          <PhraseSetCard
            phraseSet={phraseSet}
            to={`/phraseSet/${phraseSet.id}`}
            selectionMode={selectionMode}
            selected={isSelected}
            onSelectionChange={onSelectionChange}
          />
        );

        return <React.Fragment key={phraseSet.id}>{card}</React.Fragment>;
      })}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  position: relative;

  @media ${QUERIES.tabletAndUp} {
    grid-template-columns: repeat(2, 200px);
  }

  @media ${QUERIES.laptopAndUp} {
    grid-template-columns: repeat(3, 200px);
  }
`;

export default PhraseSetList;
