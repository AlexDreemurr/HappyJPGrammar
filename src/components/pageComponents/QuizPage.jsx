import { getNewQuizObject, fetchSharedDictQuiz } from "../../utility";
import Quiz from "../Quiz";
import QuizAnswer from "../QuizAnswer";
import Papa from "papaparse";
import React from "react";
import styled from "styled-components";
import supabase from "../../supabaseClient";
import { HashLoader } from "react-spinners";

function QuizPage({ source, historyQuizes, setHistoryQuizes }) {
  /* source: grammar | sharedDict */
  const [grammars, setGrammars] = React.useState([]);
  const [quizObject, setQuizObject] = React.useState({
    rawSentence: "",
    question: "",
    choices: [],
    answer: "",
    form: "",
    meaning: "",
  });
  const [isChecking, setIsChecking] = React.useState(false);
  const [curQuizNum, setCurQuizNum] = React.useState(1);
  const [userAnswer, setUserAnswer] = React.useState("");
  const [status, setStatus] = React.useState("free");

  /* 初始加载csv */
  React.useEffect(() => {
    setStatus("busy");
    if (source === "grammar") {
      fetch(
        "https://raw.githubusercontent.com/AlexDreemurr/HappyJPGrammar/assets/n2_grammar_completed.csv"
      )
        .then((res) => res.text())
        .then((text) => {
          const { data } = Papa.parse(text, {
            header: true, // 第一行作为 key
            skipEmptyLines: true,
            dynamicTyping: true, // 数字自动转 number 类型
          });
          setGrammars(data);

          // 初次加载题目
          const newQuizObject = getNewQuizObject(data);
          setQuizObject(newQuizObject);
          setStatus("free");
        });
    } else {
      fetchSharedDictQuiz(supabase).then((quizObject) => {
        setQuizObject(quizObject);
        setStatus("free");
      });
    }
  }, []);

  /* 更新下一道题目 */
  React.useEffect(() => {
    if (curQuizNum == 1) {
      return;
    }

    if (source === "grammar") {
      const newQuizObject = getNewQuizObject(grammars);
      setQuizObject(newQuizObject);
      setStatus("free");
    } else {
      fetchSharedDictQuiz(supabase).then((quizObject) => {
        setQuizObject(quizObject);
        setStatus("free");
      });
    }
  }, [curQuizNum]);

  /* 用户提交本题后，将该题储存至localStorage */
  React.useEffect(() => {
    if (!isChecking) {
      return;
    }
    const newHistoryQuizes = [...historyQuizes, quizObject];
    setHistoryQuizes(newHistoryQuizes);
    window.localStorage.setItem(
      "historyQuizes",
      JSON.stringify(newHistoryQuizes)
    );
  }, [isChecking]);

  return (
    <Main>
      {status === "busy" && <HashLoader />}
      {status !== "busy" && !isChecking && (
        <Quiz
          quizObject={quizObject}
          userAnswer={userAnswer}
          setUserAnswer={setUserAnswer}
          setIsChecking={setIsChecking}
        />
      )}
      {status !== "busy" && isChecking && (
        <QuizAnswer
          quizObject={quizObject}
          userAnswer={userAnswer}
          setIsChecking={setIsChecking}
          setCurQuizNum={setCurQuizNum}
          setStatus={setStatus}
        />
      )}
    </Main>
  );
}

const Main = styled.main`
  padding: 2rem 1.5rem;
  max-width: 800px;
`;
export default QuizPage;
