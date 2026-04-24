import Button from "./Button";
import styled from "styled-components";
import { renderQuestion } from "../utility";

export default function Quiz({
  quizObject,
  userAnswer,
  setUserAnswer,
  setIsChecking,
}) {
  /* 
     quizObject:     题目对象
     userAnswer:     用户答案state
     setUserAnswer:  用户答案state setter
     setIsChecking:  进入答案页state setter
  */
  return (
    <Article>
      <Fieldset>
        <Legend>{renderQuestion(quizObject.question)}</Legend>
        <OptionGroup>
          {quizObject.choices.map((choice, index) => (
            <SingleOption key={choice}>
              <input
                type="radio"
                id={`choice${index + 1}`}
                name="grammar-question"
                value={choice}
                checked={userAnswer === choice}
                onChange={(event) => {
                  setUserAnswer(event.target.value);
                }}
              />
              <Label htmlFor={`choice${index + 1}`}>{choice}</Label>
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
  );
}
const Article = styled.article``;
const Fieldset = styled.fieldset`
  margin-bottom: 0.5rem;
  font-family: "BIZ UDMincho";
`;
const Legend = styled.legend`
  /* background-color: hsl(70deg 5% 90%); */
  border: 1px var(--gray60) solid;
  text-indent: 1rem;
`;
const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
