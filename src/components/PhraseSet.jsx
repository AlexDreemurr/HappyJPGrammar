import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import supabase from "../supabaseClient";
import Message from "./Message";
import { HashLoader } from "react-spinners";
import Button from "./Button";
import { FONT_FAMILY } from "../constants";
import Icon from "./Icon";
import UnstyledButton from "./UnstyledButton";
import PhraseDialog from "./PhraseDialog";
import { useNavigate } from "react-router-dom";

function toHiraganaText(text) {
  return (text || "")
    .normalize("NFKC")
    .replace(/[\u30a1-\u30f6]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0x60)
    );
}

// 把片假名/浊音统统转化为对应的轻音平假名
function toHiraganaInitial(initial) {
  return toHiraganaText(initial)
    .normalize("NFD")
    .replace(/[\u3099\u309a]/g, "");
}

export function getPhraseText(phrase, showKana) {
  if (!showKana) return phrase.word;
  return toHiraganaText(phrase.reading || phrase.word);
}

function PhraseSet({ phraseSetId }) {
  const navigate = useNavigate();
  const [phrases, setPhrases] = useState([]);
  const [setInfo, setSetInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showKana, setShowKana] = useState(false);
  const [sortOrder, setSortOrder] = useState("default"); // ← 新增

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      const [setResult, phrasesResult] = await Promise.all([
        supabase
          .from("vocabulary_sets")
          .select("*")
          .eq("id", phraseSetId)
          .single(),
        supabase.from("vocabulary").select("*").eq("set_id", phraseSetId),
      ]);

      if (setResult.error || setResult.data === null) {
        setError("not_found");
      } else if (phrasesResult.error) {
        setError("fetch_error");
      } else {
        setSetInfo(setResult.data);
        setPhrases(phrasesResult.data);
      }

      setLoading(false);
    }

    fetchData();
  }, [phraseSetId]);

  // ← 新增：派生排序列表，不污染原始数据
  const sortedPhrases = useMemo(() => {
    if (sortOrder === "default") return phrases;
    return [...phrases].sort((a, b) => {
      const cmp = a.reading.localeCompare(b.reading, "ja");
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [phrases, sortOrder]);

  const groupedPhrases = useMemo(() => {
    const groups = new Map();

    sortedPhrases.forEach((phrase) => {
      const initial = (phrase.reading || phrase.word || "").trim().charAt(0);
      const key = initial ? toHiraganaInitial(initial) : "#";

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key).push(phrase);
    });

    return Array.from(groups, ([initial, items]) => ({ initial, items }));
  }, [sortedPhrases]);

  if (loading) return <HashLoader />;
  if (error === "not_found")
    return <Message type="error">没有找到该词汇集哦~</Message>;
  if (error === "fetch_error")
    return <Message type="error">加载失败，请稍后重试</Message>;

  // 点击同一个按钮循环切换： default → asc → desc → default
  function handleSortToggle() {
    setSortOrder((prev) =>
      prev === "default" ? "asc" : prev === "asc" ? "desc" : "default"
    );
  }

  const sortLabel = { default: "默认顺序", asc: "あ→ん", desc: "ん→あ" }[
    sortOrder
  ];

  return (
    <Wrapper>
      <ButtonGroup>
        <UnstyledButton onClick={() => navigate("/phraseSetList")}>
          <IconWrapper id="arrowLeft" size="1.3rem" />
        </UnstyledButton>
        <TitleWrapper>{setInfo.name}</TitleWrapper>
        <UnstyledButton onClick={handleSortToggle}>
          <IconWrapper
            id={
              sortOrder === "default"
                ? "ArrowUpDown"
                : sortOrder === "asc"
                ? "ArrowDownAZ"
                : "ArrowDownZA"
            }
            size="1.3rem"
          />
        </UnstyledButton>
        <UnstyledButton onClick={() => setShowKana((prev) => !prev)}>
          <IconWrapper id="Languages" size="1.3rem" />
        </UnstyledButton>
      </ButtonGroup>

      {/* 当排序为默认时显示的ui */}
      <DefaultWrapper>
        {sortOrder === "default" &&
          phrases.map((phrase, index) => (
            <PhraseDialog
              key={phrase.id}
              phrase={phrase}
              showKana={showKana}
              textIndent="2rem"
            />
          ))}
      </DefaultWrapper>

      {/* 当排序为按假名顺序时显示的ui */}
      {sortOrder !== "default" && (
        <PhraseGroups>
          {groupedPhrases.map((group) => (
            <PhraseGroup key={group.initial}>
              <InitialLetter>{group.initial}</InitialLetter>
              <PhraseItems>
                {group.items.map((phrase, index) => (
                  <PhraseDialog
                    key={phrase.id}
                    phrase={phrase}
                    showKana={showKana}
                    textIndent="3rem"
                  />
                ))}
              </PhraseItems>
            </PhraseGroup>
          ))}
        </PhraseGroups>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  max-width: 800px;
  min-height: 80dvh;
  display: flex;
  flex-direction: column;
  gap: 0rem;
  padding: 0 0rem;
`;
const IconWrapper = styled(Icon)`
  padding: 0.8rem;
`;
const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  /* padding: 0 2rem; */
  margin-left: 2rem;
  margin-right: 2rem;
  margin-bottom: 0rem;
  background-color: var(--gray85);
  border-bottom: 1px var(--gray60) solid;
`;
const DefaultWrapper = styled.div``;
const PhraseGroups = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;
const PhraseGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;
const PhraseItems = styled.div``;

const InitialLetter = styled.h3`
  background-color: var(--gray85);
  color: var(--gray25);
  width: fit-content;
  padding: 0.1rem 0.5rem;
  margin: 0;
  margin-left: 2rem;
  border-radius: 0.5rem;
  &:first-of-type {
    margin-top: 0.5rem;
  }
`;
const TitleWrapper = styled.p`
  margin-right: auto;
  font-size: 1rem;
  margin-left: 1rem;
  margin-top: -0.05rem;
  font-weight: 500;
`;
export default PhraseSet;
