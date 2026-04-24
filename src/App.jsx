import React from "react";
import Papa from "papaparse";
import { getNewQuizObject } from "./utility";
import GlobalStyles from "./GlobalStyles";
import Button from "./components/Button";
import Quiz from "./components/Quiz";
import QuizAnswer from "./components/QuizAnswer";
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
  const [isStart, setIsStart] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(false);
  const [curQuizNum, setCurQuizNum] = React.useState(0);
  const [userAnswer, setUserAnswer] = React.useState("");

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

  React.useEffect(() => {
    if (curQuizNum == 0) {
      return;
    }

    setQuizObject(getNewQuizObject(grammars));
  }, [curQuizNum]);

  return (
    <Root>
      <Main>
        {!isStart && (
          <Button
            onClick={() => {
              setIsStart(true);
              setCurQuizNum(1);
            }}
          >
            开始练习！
          </Button>
        )}

        {isStart && !isChecking && (
          <Quiz
            quizObject={quizObject}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            setIsChecking={setIsChecking}
          />
        )}
        {isChecking && (
          <QuizAnswer
            quizObject={quizObject}
            userAnswer={userAnswer}
            setIsChecking={setIsChecking}
            setCurQuizNum={setCurQuizNum}
          />
        )}
      </Main>
      <GlobalStyles />
    </Root>
  );
}

const Root = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Main = styled.main`
  padding: 0 2rem;
  max-width: 800px;
`;

export default App;
