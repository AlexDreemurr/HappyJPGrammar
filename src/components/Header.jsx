import React from "react";
import styled from "styled-components";
export default function Header({ setIsCheckingHistory, isCheckingHistory }) {
  return (
    <Wrapper>
      <TitleDesktop>
        尹の日本語
        <span style={{ letterSpacing: -3 }}>オンラインプラットフォーム</span>
      </TitleDesktop>
      <TitleMobile>
        尹の日本語
        <span style={{ letterSpacing: 1 }}>Platform</span>
      </TitleMobile>

      <Button onClick={() => setIsCheckingHistory(!isCheckingHistory)}>
        {!!isCheckingHistory ? "返回" : "练习历史"}
      </Button>
    </Wrapper>
  );
}

const Wrapper = styled.header`
  background-color: var(--gray15);
  color: var(--gray85);
  width: 100%;
  height: 4rem;
  position: fixed;
  top: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 1.5rem;
  /* flex-shrink: 0; */
`;

const TitleDesktop = styled.p`
  letter-spacing: -0.5;
  font-family: Hina Mincho;
  margin: 1rem 0;

  @media (max-width: 550px) {
    display: none;
  }
`;
const TitleMobile = styled(TitleDesktop)`
  display: none;

  @media (max-width: 550px) {
    display: revert;
  }
`;
const Button = styled.button`
  color: inherit;
  background-color: inherit;
  border: none;
  text-decoration: underline;
  cursor: pointer;
  /* &:hover {
    color: var(--gray60);
  } */
  &:active {
    color: var(--gray40);
  }
`;
