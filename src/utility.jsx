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
export async function translateJapanese(text) {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "你是一个日文翻译助手。用户会发送日文句子，你只需要回复对应的中文翻译，不要添加任何解释或多余内容。",
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    throw new Error(`翻译请求失败：${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}
const Blank = styled.span`
  border: 1px black solid;
  padding: 0px 1.5rem;
  margin: 0 5px;
`;
