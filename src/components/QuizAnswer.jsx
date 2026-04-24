import styled from "styled-components";
import Button from "./Button";
import React from "react";
import { PacmanLoader } from "react-spinners";
import { translateJapanese } from "../translateJapanese";
export default function QuizAnswer({
  quizObject,
  userAnswer,
  setIsChecking,
  setCurQuizNum,
}) {
  /* 
     quizObject:     题目对象
     userAnswer:     用户答案state
     setIsChecking:  进入答案页state setter
     setCurQuizNum:  用户当前题号state setter
  */
  const [needTranslate, setNeedTranslate] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [translatedText, setTranslatedText] = React.useState("");
  const [translateError, setTranslateError] = React.useState(null);

  async function handleTranslate() {
    setNeedTranslate(true);
    setIsLoading(true);
    setTranslateError(null);
    try {
      const result = await translateJapanese(quizObject.rawSentence);
      setTranslatedText(result);
    } catch (err) {
      setTranslateError("翻译失败，请重试");
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <AnswerPage>
      <p>
        {userAnswer === quizObject.answer ? "回答正确！" : "好像有点不太对..."}
      </p>
      {/* 渲染原题目及答案 */}
      {renderGrammarWithSpan(quizObject.rawSentence)}
      {needTranslate && isLoading && (
        <TranslateWrapper
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <PacmanLoader color="hsl(0deg 0% 95%)" />
          <p style={{ margin: 0 }}>翻译中</p>
        </TranslateWrapper>
      )}
      {needTranslate && !isLoading && (
        <TranslateWrapper>{translateError ?? translatedText}</TranslateWrapper>
      )}
      <p>
        <Grammar>{quizObject.form}</Grammar>的含义：{quizObject.meaning}
      </p>
      <ButtonWrapper>
        <Button onClick={handleTranslate}>获得翻译</Button>
        <Button
          onClick={() => {
            setIsChecking(false);
            setCurQuizNum((d) => d + 1);
          }}
        >
          继续:D
        </Button>
      </ButtonWrapper>
    </AnswerPage>
  );
}
const AnswerPage = styled.article`
  padding: 0 0.5rem;
`;

export function renderGrammarWithSpan(str) {
  // 查找第一个左括号（支持全角 ｛ 和半角 {）
  let leftIndex = -1;
  let leftChar = null;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === "{" || ch === "｛") {
      leftIndex = i;
      leftChar = ch;
      break;
    }
  }

  // 没有左括号，直接返回纯文本段落
  if (leftIndex === -1) {
    return <p>{str}</p>;
  }

  // 确定匹配的右括号类型
  const expectedRight = leftChar === "{" ? "}" : "｝";
  let rightIndex = -1;
  for (let i = leftIndex + 1; i < str.length; i++) {
    if (str[i] === expectedRight) {
      rightIndex = i;
      break;
    }
  }

  // 没有找到右括号，返回原文本段落
  if (rightIndex === -1) {
    return <p>{str}</p>;
  }

  // 提取三部分
  const before = str.slice(0, leftIndex); // 括号前的文本
  const inside = str.slice(leftIndex + 1, rightIndex); // 括号内的内容（语法点）
  const after = str.slice(rightIndex + 1); // 括号后的文本

  // 返回 JSX：括号位置用 <span> 替换
  return (
    <SentenceWrapper>
      {before}
      <Answer>{inside}</Answer>
      {after}
    </SentenceWrapper>
  );
}

const Answer = styled.span`
  border: 1px black solid;
  display: inline-block;
  text-indent: 0;
`;
const SentenceWrapper = styled.p`
  background-color: var(--gray85);
  padding: 1rem 1.5rem;
  margin: 0;
  margin-bottom: 0.5rem;
  text-indent: 2rem;
  border-radius: 1rem;
  font-family: "BIZ UDMincho";
`;
const TranslateWrapper = styled(SentenceWrapper)`
  background-color: var(--gray15);
  color: var(--gray85);
  font-family: "Noto Serif SC", serif;
`;
const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
const Grammar = styled.span`
  font-family: "BIZ UDMincho";
  display: inline-block;
  /* border: 1px black solid; */
  margin-right: 1px;
`;
const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
`;
