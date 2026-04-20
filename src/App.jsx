import React from "react";
import Papa from "papaparse";
import { getNewQuizObject, renderQuestion } from "./utility";
import GlobalStyles from "./GlobalStyles";
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
          <Article>
            <Fieldset>
              <Legend>{renderQuestion(quizObject.question)}</Legend>
              <OptionGroup>
                {quizObject.choices.map((choice) => (
                  <SingleOption key={choice}>
                    <input
                      type="radio"
                      name="grammar-question"
                      value={choice}
                      checked={userAnswer === choice}
                      onChange={(event) => {
                        setUserAnswer(event.target.value);
                      }}
                    />
                    <Label>{choice}</Label>
                  </SingleOption>
                ))}
              </OptionGroup>
            </Fieldset>
            <Button
              onClick={() => {
                setIsChecking(true);
              }}
            >
              提交
            </Button>
          </Article>
        )}
        {isChecking && (
          <AnswerPage>
            <p>
              {userAnswer === quizObject.answer
                ? "回答正确！"
                : "好像有点不太对..."}
            </p>
            <p>原句为：{quizObject.rawSentence}</p>
            <p>
              {quizObject.form}的含义：{quizObject.meaning}
            </p>
            <Button
              onClick={() => {
                setIsChecking(false);
                setCurQuizNum(curQuizNum + 1);
              }}
            >
              继续:D
            </Button>
          </AnswerPage>
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
`;
const Button = styled.button`
  display: block;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;
const Article = styled.article``;
const AnswerPage = styled.article`
  padding: 0 2rem;
`;
const Legend = styled.legend`
  /* background-color: hsl(70deg 5% 90%); */
  border: 1px hsl(0 0% 60%) solid;
  text-indent: 1rem;
`;
const SingleOption = styled.div`
  padding-left: 1rem;
  display: flex;
  gap: 1rem;
  align-items: baseline;
  &:first-of-type {
    margin-top: 0.5rem;
  }
`;
const Label = styled.label``;
const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
const Fieldset = styled.fieldset`
  margin-bottom: 0.5rem;
`;
export default App;
