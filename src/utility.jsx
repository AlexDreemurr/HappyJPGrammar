import React from "react";
import styled from "styled-components";
import { getStoredSharedDictSetIds } from "./sharedDictSettings";

export function splitSentence(sentence) {
  const inners = [];
  const replaced = sentence.replace(/[{｛]([^{｛}｝]*)[}｝]/g, (_, inner) => {
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
    id: Math.random(),
    rawSentence: rawSentence,
    question: sentence,
    choices: shuffle([answer, ...placeholders]),
    answer: answer,
    form: grammars[itemNum].form,
    meaning: grammars[itemNum].meaning,
  };
  return newQuizObject;
}
export async function fetchSharedDictQuiz(supabase) {
  // 访问supabase共享数据库并生成一道随机题目
  const phraseSetIds = getStoredSharedDictSetIds();
  const vocab = await getRandomVocab(supabase, phraseSetIds);
  const otherChoices = await getRandomWords(3, vocab.word, supabase, phraseSetIds);
  const rawSentence = vocab.sentences[parseInt(Math.random() * 4)];
  const [sentence, answer] = splitSentence(rawSentence);

  return {
    id: Math.random(),
    rawSentence,
    question: sentence,
    choices: shuffle([
      extractBrackets(rawSentence),
      ...otherChoices.map((v) => v.word),
    ]),
    answer,
    form: vocab.word,
    meaning: vocab.meaning,
    reading: vocab.reading,
  };
}
export async function deepseekAPI(text, prompt) {
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
          content: prompt,
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`翻译请求失败：${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

function applyPhraseSetFilter(query, phraseSetIds) {
  if (Array.isArray(phraseSetIds) && phraseSetIds.length > 0) {
    return query.in("set_id", phraseSetIds);
  }

  return query;
}

export async function getRandomVocab(supabase, phraseSetIds = null) {
  // 先查总数
  const { count } = await applyPhraseSetFilter(
    supabase.from("vocabulary").select("*", { count: "exact", head: true }),
    phraseSetIds
  );
  // 随机偏移
  const randomOffset = Math.floor(Math.random() * count);
  // 取那一条
  const { data, error } = await applyPhraseSetFilter(
    supabase.from("vocabulary").select("*"),
    phraseSetIds
  )
    .range(randomOffset, randomOffset)
    .single();
  if (error) {
    console.error(error.message);
    return null;
  }
  return data;
}
export async function getRandomWords(
  count = 3,
  avoid_word = "",
  supabase,
  phraseSetIds = null
) {
  const { count: total } = await applyPhraseSetFilter(
    supabase.from("vocabulary").select("*", { count: "exact", head: true }),
    phraseSetIds
  );

  const results = [];
  const usedWords = new Set();
  if (avoid_word) usedWords.add(avoid_word); // 提前加入黑名单

  let attempts = 0;
  while (results.length < count && attempts < count * 5) {
    attempts++;
    const offset = Math.floor(Math.random() * total);
    const { data } = await applyPhraseSetFilter(
      supabase.from("vocabulary").select("word"),
      phraseSetIds
    )
      .range(offset, offset)
      .single();

    if (data && !usedWords.has(data.word)) {
      usedWords.add(data.word);
      results.push(data);
    }
  }

  return results;
}

export function extractBrackets(str) {
  const match = str.match(/\{(.+?)\}/);
  return match ? match[1] : null;
}

export function getThreeParts(str) {
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

  return { before, inside, after };
}

// 将世界时间戳诸如
// 2026-04-25T08:36:51.511087+00:00
// 转化成中国大陆时间，并以 26/04/25 这样的格式输出
export function formatToChinaTime(isoString) {
  const date = new Date(isoString);

  const chinaDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
  );

  const year = String(chinaDate.getFullYear()).slice(2);
  const month = String(chinaDate.getMonth() + 1).padStart(2, "0");
  const day = String(chinaDate.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
}
const Blank = styled.span`
  border: 1px black solid;
  padding: 0px 1.5rem;
  margin: 0 5px;
`;
