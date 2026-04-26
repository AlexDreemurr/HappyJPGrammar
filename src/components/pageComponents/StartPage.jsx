import React from "react";
import styled from "styled-components";
import LinkWrapper from "../LinkWrapper";
import Button from "../Button";

function StartPage() {
  return (
    <div>
      <ImgWrapper>
        <Img src="/HappyJPGrammar/study_nihongo.png" />
      </ImgWrapper>
      <LinkGroup>
        <LinkWrapper to="/quiz/grammar" style={{ textDecoration: "none" }}>
          <Button>原语法练习</Button>
        </LinkWrapper>
        <LinkWrapper to="/quiz/sharedDict" style={{ textDecoration: "none" }}>
          <Button>共享词汇练习</Button>
        </LinkWrapper>
      </LinkGroup>
    </div>
  );
}

const ImgWrapper = styled.div`
  width: 8rem;
`;
const Img = styled.img`
  width: 100%;
`;
const LinkGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
export default StartPage;
