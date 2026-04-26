import React from "react";
import styled from "styled-components";

const STYLE = {
  error: {
    "--BackgroundColor": "var(--red85)",
    "--Color": "var(--red15)",
  },
  success: {
    "--BackgroundColor": "var(--green85)",
    "--Color": "var(--green15)",
  },
  info: {
    "--BackgroundColor": "var(--gray85)",
    "--Color": "var(--gray15)",
  },
};
function Message({ type = "info", children }) {
  return <Wrapper style={STYLE[type]}>{children}</Wrapper>;
}

const Wrapper = styled.div`
  /* border: 1px black solid; */
  border-radius: 0.5rem;
  background-color: var(--BackgroundColor);
  color: var(--Color);
  padding: 0.5rem 1rem;
`;

export default Message;
