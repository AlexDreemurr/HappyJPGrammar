import React from "react";
import styled from "styled-components";

export function splitSentence(sentence) {
  const inners = [];
  const replaced = sentence.replace(/｛([^｛｝]*)｝/g, (_, inner) => {
    inners.push(inner);
    return "@";
  });
  return [replaced, inners.join("~")];
}

export function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function randomPicker(list, num) {
  const unique = [...new Set(list)];
  return shuffle(unique).slice(0, num);
}

export function renderQuestion(question) {
  return question.split("@").map((part, index, arr) => (
    <React.Fragment key={index}>
      {part}
      {index < arr.length - 1 && <Blank>?</Blank>}
    </React.Fragment>
  ));
}

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

export function getNewQuizObject(grammars) {
  // 生成新题目！
  const itemNum = parseInt(Math.random() * grammars.length);
  const sentenceNum = parseInt(Math.random() * 4) + 1;
  const rawSentence = grammars[itemNum][`sentence${sentenceNum}`];
  const [sentence, answer] = splitSentence(rawSentence);
  const placeholders = randomPicker(grammars, 3).map((d) => d.form);

  const newQuizObject = {
    rawSentence: rawSentence,
    question: sentence,
    choices: shuffle([answer, ...placeholders]),
    answer: answer,
    form: grammars[itemNum].form,
    meaning: grammars[itemNum].meaning,
  };
  return newQuizObject;
}

const Blank = styled.span`
  border: 1px black solid;
  padding: 0px 1.5rem;
  margin: 0 5px;
`;
const Answer = styled.span`
  border: 1px black solid;
  display: inline-block;
  text-indent: 0;
`;
const SentenceWrapper = styled.p`
  background-color: hsl(0deg 0% 85%);
  padding: 1rem 1.5rem;
  text-indent: 2rem;
  border-radius: 1rem;
`;
