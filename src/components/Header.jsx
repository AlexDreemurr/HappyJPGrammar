import React from "react";
import styled from "styled-components";
import LinkWrapper from "./LinkWrapper";

export default function Header() {
  return (
    <Wrapper>
      <TitleDesktop to="/">
        尹の日本語
        <span style={{ letterSpacing: -3 }}>オンラインプラットフォーム</span>
      </TitleDesktop>
      <TitleMobile to="/">
        尹の日本語
        <span style={{ letterSpacing: 1 }}>Platform</span>
      </TitleMobile>

      <LinkWrapper to="/contribute">加题</LinkWrapper>
      <LinkWrapper to="/history">历史</LinkWrapper>
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
  gap: 1rem;
  align-items: baseline;
  padding: 0 1.5rem;
`;

const TitleDesktop = styled(LinkWrapper)`
  font-size: 1.3rem;
  color: var(--gray85);
  text-decoration: none;
  letter-spacing: -0.5;
  font-family: Hina Mincho;
  margin: 0.9rem 0;
  margin-right: auto;

  @media (max-width: 600px) {
    display: none;
  }
`;
const TitleMobile = styled(TitleDesktop)`
  display: none;

  @media (max-width: 600px) {
    display: revert;
  }
`;
