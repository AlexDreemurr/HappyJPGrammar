import React from "react";
import styled from "styled-components";
import { HashLoader } from "react-spinners";
import { useParams } from "react-router-dom";
import PhraseSet from "../PhraseSet";
import PhraseSetList from "../PhraseSetList";
import {
  AddPhraseSetDialog,
  DeletePhraseSetDialog,
  EditPhraseSetDialog,
} from "../PhraseSetActions";
import Icon from "../Icon";
import Message from "../Message";
import UnstyledButton from "../UnstyledButton";
import usePhraseSets from "../../hooks/usePhraseSets";
import { QUERIES } from "../../constants";

function PhraseSetPage() {
  const { phraseSetId } = useParams();

  if (phraseSetId) {
    return <PhraseSet phraseSetId={phraseSetId} />;
  }

  return <PhraseSetIndexPage />;
}

function PhraseSetIndexPage() {
  const { phraseSets, status, refetchPhraseSets } = usePhraseSets();
  const [selectionMode, setSelectionMode] = React.useState(false);
  const [selectedPhraseSetIds, setSelectedPhraseSetIds] = React.useState([]);

  const selectedPhraseSets = phraseSets.filter((phraseSet) =>
    selectedPhraseSetIds.includes(phraseSet.id)
  );

  function handleSelectionModeToggle() {
    setSelectionMode((currentMode) => {
      if (currentMode) {
        setSelectedPhraseSetIds([]);
      }

      return !currentMode;
    });
  }

  function handlePhraseSetSelectionChange(phraseSetId, checked) {
    setSelectedPhraseSetIds(checked ? [phraseSetId] : []);
  }

  function handlePhraseSetsChanged() {
    setSelectedPhraseSetIds([]);
    refetchPhraseSets();
  }

  if (status === "busy") {
    return (
      <LoadingWrapper>
        <HashLoader />
      </LoadingWrapper>
    );
  }

  return (
    <Wrapper>
      <ContentFrame>
        <ActionIcons>
          {selectionMode && (
            <EditPhraseSetDialog
              selectedPhraseSet={selectedPhraseSets[0] ?? null}
              onChanged={handlePhraseSetsChanged}
            />
          )}
          {selectionMode && (
            <DeletePhraseSetDialog
              selectedPhraseSets={selectedPhraseSets}
              onChanged={handlePhraseSetsChanged}
            />
          )}
          <SelectModeButton
            type="button"
            aria-label={selectionMode ? "退出选择模式" : "进入选择模式"}
            aria-pressed={selectionMode}
            onClick={handleSelectionModeToggle}
            $active={selectionMode}
          >
            <Icon id="select" size="1.3rem" color="var(--gray15)" />
          </SelectModeButton>

          <AddPhraseSetDialog onChanged={refetchPhraseSets} />
        </ActionIcons>

        {status === "error" && (
          <Message type="error">词汇集加载失败，请稍后重试。</Message>
        )}
        {status === "ok" && (
          <PhraseSetList
            phraseSets={phraseSets}
            selectionMode={selectionMode}
            selectedPhraseSetIds={selectedPhraseSetIds}
            onSelectionChange={handlePhraseSetSelectionChange}
          />
        )}
      </ContentFrame>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
`;

const ContentFrame = styled.div`
  width: 100%;
  max-width: calc(${200 * 2}px + 0.5rem);
  margin: 0 auto;
  padding: 0 1rem;

  @media ${QUERIES.laptopAndUp} {
    max-width: calc(${200 * 3}px + ${0.5 * 2}rem);
  }
`;

const ActionIcons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-right: 0rem;
  margin-bottom: 0.3rem;

  @media ${QUERIES.tabletAndUp} {
    margin-right: -2rem;
  }
`;

const LoadingWrapper = styled.div`
  width: 100%;
  min-height: 80dvh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SelectModeButton = styled(UnstyledButton)`
  padding: 0.8rem;
  color: var(--gray15);
  border-radius: 1rem;
  background-color: ${(p) => (p.$active ? "var(--gray85)" : "transparent")};
`;

export default PhraseSetPage;
