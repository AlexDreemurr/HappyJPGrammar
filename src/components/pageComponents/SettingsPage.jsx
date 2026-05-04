import React from "react";
import styled from "styled-components";
import { HashLoader } from "react-spinners";
import usePhraseSets from "../../hooks/usePhraseSets";
import Message from "../Message";
import PhraseSetCard from "../PhraseSetCard";
import {
  getStoredSharedDictSetIds,
  storeSharedDictSetIds,
} from "../../sharedDictSettings";
import { FONT_SIZE } from "../../constants";

function SettingsPage() {
  const { phraseSets, status } = usePhraseSets();
  const [selectedSetIds, setSelectedSetIds] = React.useState([]);

  React.useEffect(() => {
    if (status !== "ok") {
      return;
    }

    const availableIds = phraseSets.map((phraseSet) => phraseSet.id);
    const storedIds = getStoredSharedDictSetIds();
    const initialIds =
      storedIds === null
        ? availableIds
        : storedIds.filter((id) => availableIds.includes(id));
    const safeIds = initialIds.length > 0 ? initialIds : availableIds;

    setSelectedSetIds(safeIds);
    storeSharedDictSetIds(safeIds);
  }, [phraseSets, status]);

  function handleToggle(setId) {
    setSelectedSetIds((currentSetIds) => {
      const isSelected = currentSetIds.includes(setId);
      const nextSetIds = isSelected
        ? currentSetIds.filter((currentSetId) => currentSetId !== setId)
        : [...currentSetIds, setId];

      if (nextSetIds.length === 0) {
        return currentSetIds;
      }

      storeSharedDictSetIds(nextSetIds);
      return nextSetIds;
    });
  }

  return (
    <Wrapper>
      <HeaderGroup>
        <Title>设置</Title>
        <Description>
          点击词汇集卡片来设置“共享单词练习”的题库范围。
        </Description>
      </HeaderGroup>

      {status === "busy" && <HashLoader />}
      {status === "error" && (
        <Message type="error">词汇集加载失败，请稍后重试。</Message>
      )}
      {status === "ok" && (
        <>
          <CardGrid>
            {phraseSets.map((phraseSet) => {
              const isSelected = selectedSetIds.includes(phraseSet.id);

              return (
                <SelectableCard
                  key={phraseSet.id}
                  type="button"
                  phraseSet={phraseSet}
                  aria-pressed={isSelected}
                  data-selected={isSelected}
                  data-status={isSelected ? "已包含" : "未包含"}
                  onClick={() => handleToggle(phraseSet.id)}
                />
              );
            })}
          </CardGrid>
        </>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.main`
  width: 100%;
  max-width: 800px;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const HeaderGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0rem;
`;

const Title = styled.h1`
  font-size: ${FONT_SIZE.giant};
`;

const Description = styled.p`
  color: var(--gray40);
  font-size: 1rem;
`;

const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const SelectableCard = styled(PhraseSetCard)`
  width: 160px;
  height: 112px;
  font-size: 0.95rem;
  transition: box-shadow 120ms ease, opacity 120ms ease;

  /* &:hover {
    transform: translateY(-1px);
  } */

  &[data-selected="true"] {
    box-shadow: 0 0 0 2px var(--gray95), 0 0 0 5px var(--green15);
  }

  &[data-selected="false"] {
    opacity: 0.58;
  }

  &::after {
    content: attr(data-status);
    position: absolute;
    right: 0.5rem;
    bottom: 0.4rem;
    font-size: 0.75rem;
    line-height: 1.3;
    padding: 0.05rem 0.35rem;
    border-radius: 999px;
    background-color: var(--gray95);
    color: var(--gray15);
  }
`;

export default SettingsPage;
