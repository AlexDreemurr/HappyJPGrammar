import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

function LinkWrapper({ children, ...delegated }) {
  return <Wrapper {...delegated}>{children}</Wrapper>;
}

const Wrapper = styled(Link)`
  padding: 0;
  color: inherit;
  background-color: inherit;
  text-decoration: underline;
  cursor: pointer;

  &:active {
    color: var(--gray40);
  }
`;

export default LinkWrapper;
