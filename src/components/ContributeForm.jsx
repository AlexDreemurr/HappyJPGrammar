import React from "react";
import styled from "styled-components";
import supabase from "../supabaseClient";
import { deepseekAPI } from "../utility";
import Message from "./Message";
import { PacmanLoader } from "react-spinners";

function ContributeForm() {
  const wordInputId = React.useId();
  const contributerInputId = React.useId();
  const [word, setWord] = React.useState("");
  const [contributor, setContributor] = React.useState("");
  const [status, setStatus] = React.useState("free");
  const [errorMsg, setErrorMsg] = React.useState("");

  async function WordImplement() {
    setStatus("busy");

    /* 先查重， 如果已经存在则不添加！ */
    const { data: existing, error: queryError } = await supabase
      .from("vocabulary")
      .select("word")
      .eq("word", word.trim())
      .maybeSingle();

    if (queryError) {
      setStatus("error");
      setErrorMsg(queryError.message);
      return;
    }

    /* 如果数据库中已经存在这个词汇，报错 */
    if (existing) {
      setStatus("error");
      setErrorMsg(`「${word}」已经存在于词典中`);
      return;
    }

    const result = await deepseekAPI(
      `单词：${word}，贡献者：${contributor}`,
      `你是一个日语词典助手。用户会给你一个日语单词和贡献者名字。
      首先判断输入是否是一个真实存在的日语单词。如果不是，只返回：{"valid": false}
      如果是，返回以下格式的JSON对象，不要有任何多余的文字和markdown格式，只返回纯JSON。
        要求：
        1. sentences数组包含４个例文（字符串），例文中需要包含word或者word的变形。每个例文长度必须在80字到150字之间，难度逐渐递增（从N4到N2）。句子需要有真实情景。
        2. 每个句子中把该单词的活用形用大括号括起来，例如：「彼は約束を{改めた}。」

        格式如下：
        {
          "valid": true,
          "word": "单词原形",
          "reading": "假名读法",
          "meaning": "中文意思",
          "level": "JLPT等级，只能是N1/N2/N3/N4/N5其中一个",
          "contributor_name": "贡献者名字",
          "sentences": [
              "sentence1"， "sentence2", "sentence3", "sentence4"
          ]
        }`
    );

    const vocabData = JSON.parse(result);
    /* 如果该词汇不合法，报错 */
    if (!vocabData.valid) {
      setStatus("error");
      setErrorMsg(`「${word}」不是一个有效的日语单词`);
      return;
    }

    delete vocabData.valid; // 删掉 valid 字段再入库

    /* 用户给出的词没有任何问题，我们再上传数据库 */
    const { error } = await supabase.from("vocabulary").insert(vocabData);
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      console.error("插入失败", error.message);
    } else {
      setStatus("success");
      console.log("插入成功");
    }
    // const {error} = await supabase.from('vocabulary').insert
  }

  function handleSubmit(event) {
    event.preventDefault();
    WordImplement();
  }

  return (
    <Wrapper onSubmit={handleSubmit}>
      <StatusWrapper>
        {status === "busy" && (
          <Message>
            <BusyWrapper>
              <PacmanLoader color="var(--gray15)" />
              提交中
            </BusyWrapper>
          </Message>
        )}
        {status === "error" && (
          <Message type="error">发生错误: {errorMsg}</Message>
        )}
        {status === "success" && <Message type="success">提交成功！</Message>}
      </StatusWrapper>

      <RowWrapper htmlFor={wordInputId}>
        词语名
        <InputWrapper
          id={wordInputId}
          placeholder="改める"
          value={word}
          onChange={(event) => setWord(event.target.value)}
          required
          disabled={status === "busy"}
        />
      </RowWrapper>

      <RowWrapper htmlFor={contributerInputId}>
        贡献者
        <InputWrapper
          id={contributerInputId}
          placeholder="〇〇さん"
          value={contributor}
          onChange={(event) => setContributor(event.target.value)}
          disabled={status === "busy"}
        />
      </RowWrapper>

      <button disabled={status === "busy"}>提交</button>
    </Wrapper>
  );
}

const Wrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1.5rem;
  min-width: 0;
  max-width: 500px;
  width: 100%;
`;

const RowWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
  min-width: 0;
`;

const InputWrapper = styled.input`
  display: block;
  min-width: 0;
  flex: 1 100000 0;
  outline: none;
  &:focus {
    outline: 2px solid var(--gray15);
    border-radius: 1px;
    outline-offset: 2px;
  }
  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0px 1000px white inset;
    outline: none;
  }
`;
const StatusWrapper = styled.div`
  width: 100%;
`;
const BusyWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
`;
export default ContributeForm;
