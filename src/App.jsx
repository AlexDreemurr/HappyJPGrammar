import React from "react";
import Papa from "papaparse";
import { getNewQuizObject } from "./utility";
import GlobalStyles from "./GlobalStyles";
import Header from "./components/Header";
import Button from "./components/Button";
import Quiz from "./components/Quiz";
import QuizAnswer from "./components/QuizAnswer";
import HistoryQuizes from "./components/HistoryQuizes";
import styled from "styled-components";

function App() {
  const [grammars, setGrammars] = React.useState([]);
  const [quizObject, setQuizObject] = React.useState({
    rawSentence: "",
    question: "",
    choices: [],
    answer: "",
    form: "",
    meaning: "",
  });
  const [historyQuizes, setHistoryQuizes] = React.useState(() => {
    return JSON.parse(window.localStorage.getItem("historyQuizes") ?? "[]");
  });
  const [isStart, setIsStart] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(false);
  const [curQuizNum, setCurQuizNum] = React.useState(0);
  const [userAnswer, setUserAnswer] = React.useState("");
  const [isCheckingHistory, setIsCheckingHistory] = React.useState(false);

  /* 初始加载csv */
  React.useEffect(() => {
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
        // console.log(data);
      });
  }, []);

  /* 更新下一道题目 */
  React.useEffect(() => {
    if (curQuizNum == 0) {
      return;
    }
    const newQuizObject = getNewQuizObject(grammars);
    const newHistoryQuizes = [...historyQuizes, newQuizObject];
    setQuizObject(newQuizObject);
    setHistoryQuizes(newHistoryQuizes);
    window.localStorage.setItem(
      "historyQuizes",
      JSON.stringify(newHistoryQuizes)
    );
  }, [curQuizNum]);

  return (
    <Root>
      <Header
        setIsCheckingHistory={setIsCheckingHistory}
        isCheckingHistory={isCheckingHistory}
      />
      <HelperBox />
      <Main>
        {isCheckingHistory && <HistoryQuizes historyQuizes={historyQuizes} />}
        {!isCheckingHistory && !isStart && (
          <div>
            <ImgWrapper>
              <Img src="/HappyJPGrammar/study_nihongo.png" />
            </ImgWrapper>
            <Button
              onClick={() => {
                setIsStart(true);
                setCurQuizNum(1);
              }}
            >
              开始练习！
            </Button>
          </div>
        )}

        {!isCheckingHistory && isStart && !isChecking && (
          <Quiz
            quizObject={quizObject}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            setIsChecking={setIsChecking}
          />
        )}
        {!isCheckingHistory && isChecking && (
          <QuizAnswer
            quizObject={quizObject}
            userAnswer={userAnswer}
            setIsChecking={setIsChecking}
            setCurQuizNum={setCurQuizNum}
          />
        )}
      </Main>
      <HelperBox />
      <GlobalStyles />
    </Root>
  );
}

const HelperBox = styled.div`
  flex: 1;
  width: 100%;
  &:first-of-type {
    min-height: 4rem;
  }
`;
const Root = styled.div`
  position: relative;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const Main = styled.main`
  padding: 2rem 1.5rem;
  max-width: 800px;
`;
const ImgWrapper = styled.div`
  width: 8rem;

  /* border: 1px black solid; */
`;
const Img = styled.img`
  width: 100%;
`;
export default App;
